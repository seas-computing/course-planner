import { Test, TestingModule } from '@nestjs/testing';
import { string } from 'common/data';
import { strictEqual } from 'assert';
import { DevStrategy } from 'server/auth/dev.strategy';
import { SessionModule } from 'nestjs-session';
import { Request } from 'express';
import { HarvardKeyProfile } from '../saml.strategy';

describe('Dev Strategy', function () {
  it('adds a dummy user to the session', async function () {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        SessionModule.forRoot({
          session: {
            secret: string,
            resave: true,
            saveUninitialized: true,
          },
        }),
      ],
      providers: [
        DevStrategy,
      ],
    }).compile();

    const dev = moduleRef.get<DevStrategy>(DevStrategy);

    const request = {
      session: {},
    } as Request;

    const result = dev.validate(request);

    const {
      eppn,
      firstName,
      lastName,
      email,
    } = result.session.user as HarvardKeyProfile;

    strictEqual(eppn, 'abc123@harvard.edu');
    strictEqual(firstName, 'Test');
    strictEqual(lastName, 'User');
    strictEqual(email, 'noreply@seas.harvard.edu');
  });
});
