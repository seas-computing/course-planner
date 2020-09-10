import {
  Controller,
  Get,
  UseGuards,
  Req,
  HttpStatus,
  Redirect,
  Inject,
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
import { Authentication } from 'server/auth/authentication.guard';
import { ConfigService } from '../config/config.service';

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
    status: HttpStatus.FOUND,
    description: 'If the user authenticates successfully, return to the original page',
  })
  @UseGuards(Authentication)
  @Get('/login')
  @Redirect('')
  public useHarvardKeyLogin(
    @Req() req: Request
  ): RedirectResponse {
    let redirectTo = this.config.get('CLIENT_URL');
    if ('loginOrigin' in req.session) {
      redirectTo = req.session.loginOrigin as string;
      delete req.session.loginOrigin;
    }
    return {
      url: redirectTo,
      statusCode: HttpStatus.FOUND,
    };
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
  public deleteRequest(
    @Req() req: Request
  ): RedirectResponse {
    req.logout();
    return {
      url: 'https://key.harvard.edu/logout',
      statusCode: HttpStatus.SEE_OTHER,
    };
  }
}
