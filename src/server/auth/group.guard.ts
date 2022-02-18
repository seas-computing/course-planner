import {
  CanActivate,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GROUP } from 'common/constants';
import { Request } from 'express';
import { User } from 'common/classes';

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
    if (request?.session?.user?.groups) {
      const user = request.session.user as User;
      // Allow admins to access any endpoint
      if (user.groups.includes(GROUP.ADMIN)) {
        return true;
      }
      // Allow members of any group to access read-only endpoints
      if (this.requiredGroup === GROUP.READ_ONLY) {
        return user.groups.some(
          (group) => Object.values(GROUP).includes(group)
        );
      }
      return user.groups.includes(this.requiredGroup);
    }
    return false;
  }
}

export { RequireGroup };
