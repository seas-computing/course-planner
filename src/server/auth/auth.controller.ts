import {
  Controller,
  Get,
  Req,
  HttpStatus,
  Redirect,
  Inject,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  RedirectResponse,
} from '@nestjs/core/router/router-response-controller';
import {
  ApiOperation,
  ApiUseTags,
  ApiResponse,
} from '@nestjs/swagger';
import { User } from 'common/classes';
import qs from 'querystring';
import axios from 'axios';
import { ConfigService } from '../config/config.service';
import { GROUP } from '../../common/constants';

/**
 * Describes the reponse object from the Harvard Key Server
 */

export interface HarvardKeyResponse {
  serviceResponse: {
    /** Will only be present if auth is successful */
    authenticationSuccess?: {
      /** The user's eppn */
      user: string,
      attributes: {
      /** The user's eppn */
        eduPersonPrincipalName: string[],
        /** The user's firstName */
        givenName?: string[],
        /** The user's lastName */
        sn?: string[],
        /** A list of all groups to which the user belongs */
        memberOf?: GROUP[],
      }
    },
    /** Will only be present if auth fails */
    authenticationFailure?: {
      /** A short descriptor for the error */
      code: string,
      /** A Longer descriptiong for the failure */
      description: string,
    },
  }
}

@ApiUseTags('Authentication')
@Controller('/')
export class AuthController {
  @Inject(ConfigService)
  public config: ConfigService;

  /**
   * Requires the user to authenticate against the current Passport Strategy,
   * then redirects to the client's base URL.
   */
  @ApiOperation({
    title: 'Log the user in to Harvard Key and redirect to original path',
  })
  @ApiResponse({
    status: HttpStatus.SEE_OTHER,
    description: 'Redirect the user to the Harvard Key login page',
  })
  @Get('/login')
  @Redirect('')
  public useHarvardKeyLogin(
    @Req() req: Request
  ): RedirectResponse {
    const referer = req.get('Referer');
    if (referer && referer.startsWith(this.config.get('CLIENT_URL'))) {
      req.session.loginOrigin = referer;
    }
    const redirectTo = `${this.config.get('CAS_URL')}/login?${qs.encode(
      {
        service: `${this.config.get('SERVER_URL')}/validate`,
      }
    )}`;
    return {
      url: redirectTo,
      statusCode: HttpStatus.SEE_OTHER,
    };
  }

  /**
   * After the user logs in with HarvardKey, this endpoint will parse their
   * data and store it in the session.
   */

  @ApiOperation({
    title: 'Validate the data returned by harvardkey',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'if the user data checks out, return the the original page',
  })
  @Get('/validate')
  @Redirect('')
  public async validateHarvardKeyData(
    @Req() req: Request,
      @Query('ticket') ticket: string
  ): Promise<RedirectResponse> {
    if (ticket) {
      const response = await axios.request({
        url: `${this.config.get('CAS_URL')}/serviceValidate`,
        params: {
          ticket,
          service: `${this.config.get('SERVER_URL')}/validate`,
          format: 'JSON',
        },
      });
      const validation = response.data as HarvardKeyResponse;
      if ('authenticationSuccess' in validation.serviceResponse) {
        const validUser = validation
          .serviceResponse
          .authenticationSuccess
          .attributes;
        const authorizedUser = new User({
          eppn: validUser.eduPersonPrincipalName?.[0],
          lastName: validUser.sn?.[0],
          firstName: validUser.givenName?.[0],
          groups: Array.isArray(validUser.memberOf)
            ? validUser
              .memberOf
              .filter((group) => group.startsWith(
                this.config.get('GROUPER_PREFIX')
              ))
            : [],
        });
        req.session.user = authorizedUser;
        return {
          url: (req.session.loginOrigin as string
            || `${this.config.get('CLIENT_URL')}/courses`),
          statusCode: HttpStatus.FOUND,
        };
      }
      if ('authenticationFailure' in validation.serviceResponse) {
        throw new UnauthorizedException(
          validation.serviceResponse.authenticationFailure.description
        );
      }
    }
    throw new UnauthorizedException();
  }

  /**
   * Clear the user session from the cache, then redirect to the Harvard Key
   * logout page.
   */
  @ApiOperation({
    title: 'Delete the user\'s session and redirect to the HarvardKey log out page',
  })
  @ApiResponse({
    status: HttpStatus.SEE_OTHER,
    description: 'After deleting the session, redirect to HarvardKey log out',
  })
  @Get('/logout')
  @Redirect('')
  public logoutUserSession(
    @Req() req: Request
  ): RedirectResponse {
    delete req.session.user;
    return {
      url: 'https://key.harvard.edu/logout',
      statusCode: HttpStatus.SEE_OTHER,
    };
  }
}
