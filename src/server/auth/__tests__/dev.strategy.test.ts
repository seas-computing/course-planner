import { Test, TestingModule } from '@nestjs/testing';
import { string } from 'testData';
import { strictEqual } from 'assert';
import { DevStrategy } from 'server/auth/dev.strategy';
import { SessionModule } from 'nestjs-session';

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

    const result = dev.validate({} as Express.Request);

    const {
      eppn,
      firstName,
      lastName,
      email,
    } = result;

    strictEqual(eppn, 'abc123@harvard.edu');
    strictEqual(firstName, 'Test');
    strictEqual(lastName, 'User');
    strictEqual(email, 'noreply@seas.harvard.edu');
  });
});
