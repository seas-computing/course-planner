import { Injectable } from '@nestjs/common';
import session, { Store } from 'express-session';
import { ConfigService } from '../config/config.service';

/**
 * Configures express sessions for storing user data returned from Harvard Key.
 * Session key will be stored in a cookie and used to retrieve the values
 */
@Injectable()
class SessionMiddleware {
  public use: Function;

  public constructor(config: ConfigService, store: Store) {
    this.use = session({
      secret: config.get('SESSION_SECRET'),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
      store,
      resave: true,
      saveUninitialized: false,
    });
  }
}

export { SessionMiddleware };
