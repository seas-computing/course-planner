import {
  CanActivate,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GROUP } from 'common/constants';
import { Request } from 'express';
import { User } from 'common/classes';
import { checkUserGroup } from 'common/utils/checkUserGroup';

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
      const user = new User(request.session.user);
      return checkUserGroup(user, this.requiredGroup);
    }
    return false;
  }
}

export { RequireGroup };
