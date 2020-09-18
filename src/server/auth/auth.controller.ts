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
 * Describes the reponse object from the Harvard Key Server during the
 * validation phase. For more information see
 * {@link https://iam.harvard.edu/resources/idp-guide}
 */

export interface HarvardKeyResponse {
  serviceResponse: {
    /**
     * This field will only be present if the user successfully validates.
     * Note that there are potentially more fields that can be included under
     * attributes, but we're only listing here the fields that were included
     * with the course planner application request
     */
    authenticationSuccess?: {
      /** The user's eppn */
      user: string,
      attributes: {
        /**
        * eduPersonPrincipalName (EPPN), is an attribute defined in the {@link
        * http://middleware.internet2.edu/eduperson/docs/internet2-mace-dir-eduperson-201203.html
        * Internet2 eduPerson object class specification} that is intended to
        * uniquely identify a user at a given institution. At Harvard, we
        * create an EPPN for each user by transforming a long "opaque internal
        * identifier" into a shorter opaque identifier and then adding on
        * "@harvard.edu" - for example, 4A2849CF119852@harvard.edu.
        *
        * An EPPN remains the same even if a user change their name — making it, in
        * identity management terminology, unique and persistent.
        *
        * **Please note:** Whilst [[eppn]] may _look_ the same as an email address -
        * an email addresses can change (for example, if a user changes their
        * name etc.), whilst an EPPN cannot. This means that EPPN is **NOT**
        * nececcarily the same as `email`(inherited from `Profile`) and the two
        * should not be considered interchangeable
        *
        * For more information on harvard key and identity management, see
        * {@link https://iam.harvard.edu/resources/idp-guide the IAM web site}
        *
        * @example [4A2849CF119852@harvard.edu]
        */
        eduPersonPrincipalName: string[],
        /**
         * The user's first name
         * @example [John]
         */
        givenName?: string[],
        /**
         * The user's last name
         * @example [Harvard]
         */
        sn?: string[],
        /**
         * A list of all grouper groups in which the user is a member.
         * @example: [
         *  'harvard:org:schools:seas:managed:seas-course-planning:roles-admin-seas-course-planning'
         *  'harvard:org:schools:seas:managed:seas-course-planning:roles-all-users-seas-course-planning'
         * ]
         */
        memberOf?: GROUP[],
      }
    },
    /** Will only be present if the user validations fails */
    authenticationFailure?: {
      /**
       * A short descriptor for the error
       * See {@link https://apereo.github.io/cas/4.2.x/protocol/CAS-Protocol-Specification.html#253-error-codes}
       * @example INVALID_REQUEST
       */

      code: string,
      /** A longer description for the failure */
      description?: string,
    },
  }
}

/**
 * This controller implements the CAS 3.0 protocol, which is used to
 * authenticate users with Harvard Key. The intended login flow is
 * roughly as follows:
 *
 * 1. The user visits the client application
 * 2. If the user is not logged in, the client redirects to the the /login
 *    endpoint on the server
 * 3. The server responds with a redirect to the Harvard Key login
 * 4. The user logs into Harvard Key
 * 5. Harvard Key redirects the client to the /validate endpoint, including a
 *    'ticket' query parameter
 * 6. The server sends a request back to Harvard Key, including that ticket
 * 7. Harvard Key verifies the ticket, and responds to the server with the
 *    user data
 * 8. The server redirects the user back to the client application
 *
 * For more information, see: {@link https://apereo.github.io/cas/4.2.x/protocol/CAS-Protocol-Specification.html#cas-protocol-30-specification}
 */

@ApiUseTags('Authentication')
@Controller('/')
export class AuthController {
  @Inject(ConfigService)
  public config: ConfigService;

  /**
   * This is the entrypoint to the authentication process. We will first save
   * 'referer' header value in session so that we can later redirect back to
   * the initiating page. Then we redirect the user to Harvard Key's login page
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
   * After the user logs in with HarvardKey, this endpoint will submit their
   * authentication ticket back to Harvard Key, which will return their user
   * data. We simply parse the data in to a [[User]] object and store it in
   * the session.
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
