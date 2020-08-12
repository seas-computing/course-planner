import {
  Controller,
  Get,
  UseGuards,
  UnauthorizedException,
  Session,
  Request,
  HttpStatus,
  Query,
  Redirect,
} from '@nestjs/common';
import {
  RedirectResponse,
} from '@nestjs/core/router/router-response-controller';
import {
  ApiOperation,
  ApiOkResponse,
  ApiUseTags,
  ApiResponse,
} from '@nestjs/swagger';
import { UserResponse } from 'common/dto/users/userResponse.dto';
import { Authentication } from 'server/auth/authentication.guard';

@ApiUseTags('User')
@Controller('api/users')
export class UserController {
  /**
   * Respond to client with the data in session about the user currently logged
   * in to the app. If there is no user data in the session, return an
   * UnauthorizedException.
   */
  @Get('/current')
  @ApiOperation({
    title: 'Return the currently logged-in user\'s data from session',
  })
  @ApiOkResponse({
    type: UserResponse,
    description: 'Details about the currently logged-in user',
    isArray: false,
  })
  public getCurrentUser(
    @Session() sesh: Express.Session
  ): UserResponse {
    if ('user' in sesh) {
      return sesh.user;
    }
    throw new UnauthorizedException({
      message: 'User has not logged in',
      statusCode: HttpStatus.UNAUTHORIZED,
      loginPath: 'api/users/login',
    });
  }

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
    @Query('redirectTo') redirectPath: string
  ): RedirectResponse {
    return {
      url: `${process.env.CLIENT_URL}/${redirectPath}`,
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
  public deleteSession(
    @Request() req: Express.Request
  ): RedirectResponse {
    delete req.session;
    return {
      url: 'https://key.harvard.edu/logout',
      statusCode: HttpStatus.SEE_OTHER,
    };
  }
}
