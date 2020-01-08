import {
  CanActivate,
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { GROUP } from 'common/constants';

@Injectable()
class RequireGroup implements CanActivate {
  private requiredGroup: GROUP;

  public constructor(requiredGroup: GROUP) {
    this.requiredGroup = requiredGroup;
  }

  public canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return context.switchToHttp().getRequest()
      .session
      .user
      .groups
      .includes(this.requiredGroup);
  }
}

export { RequireGroup };
