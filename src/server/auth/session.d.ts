// import Express from 'express';
import { GROUP } from '../../common/constants';

declare module 'express-session' {
  interface SessionData {
    user?: UserSessionData;
    loginOrigin?: string;
  }
}

export interface UserSessionData {
  firstName: string;
  lastName: string;
  eppn: string;
  groups: GROUP[];
}
