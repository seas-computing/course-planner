import {
  CanActivate,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GROUP } from 'common/constants';
import { Request } from 'express';
import { User } from 'server/user/user.entity';

@Injectable()
class RequireGroup implements CanActivate {
  private requiredGroup: GROUP;

  public constructor(requiredGroup: GROUP) {
    this.requiredGroup = requiredGroup;
  }

  public canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request?.session?.user) {
      const user = request.session.user as User;
      return user.groups.includes(this.requiredGroup);
    }
    return false;
  }
}

export { RequireGroup };
