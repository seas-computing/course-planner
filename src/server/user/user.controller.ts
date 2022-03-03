import {
  Controller,
  Get,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiOperation,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponse } from 'common/dto/users/userResponse.dto';
import { Authentication } from '../auth/authentication.guard';

@ApiTags('User')
@Controller('api/users')
export class UserController {
  /**
   * Respond to client with the data in session about the user currently logged
   * in to the app. If there is no user data in the session, return an
   * UnauthorizedException.
   */
  @Get('/current')
  @ApiOperation({
    summary: 'Return the currently logged-in user\'s data from session',
  })
  @ApiOkResponse({
    type: UserResponse,
    description: 'Details about the currently logged-in user',
    isArray: false,
  })
  @UseGuards(Authentication)
  public getCurrentUser(
    @Req() req: Request
  ): UserResponse | Record<string, unknown> {
    if (req?.session?.user?.eppn) {
      return req.session.user as UserResponse;
    }
    throw new UnauthorizedException();
  }
}
