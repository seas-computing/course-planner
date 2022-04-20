import { restore } from 'sinon';
import MockDB from './tests/mocks/database/MockDB';

before(function (done) {
  process.env.NODE_ENV = 'testing';
  process.env.SERVER_URL = 'https://computing-apps.seas.harvard.edu/course-planner';
  process.env.CLIENT_URL = 'https://planning.seas.harvard.edu/courses';
  process.env.PUBLIC_CLIENT_URL = 'https://info.seas.harvard.edu/courses';

  if (process.env.MOCHA_NEEDS_DATABASE === '1') {
    const randomPort = Math.floor(Math.random() * 1000) + 30000;
    const timestamp = Date.now().valueOf();
    const containerName = `testing-database-${randomPort}-${timestamp}`;
    this.database = new MockDB({
      containerName,
      databaseName: 'course_planner_testing',
      user: 'testuser',
      password: 'testpassword',
      port: randomPort,
    });
    this.database.init()
    .then(() => {
      console.log(`Starting Postgres in container ${containerName}`);
      done();
    })
    .catch(this.bail)
  } else {
    done();
  }
});

after(function (done) {
  Object.keys(require.cache).forEach((key) => {
    delete require.cache[key];
  })
  if (process.env.MOCHA_NEEDS_DATABASE === '1') {
    this.database.stop()
    .then(done)
    .catch((error: Error) => {
      console.log(error);
      console.log(`
Encountered an error while attempting to stop the database container.
You may need to manually remove the container by running:

  docker container rm --force ${this.database.name}`);
        done();
    });
  } else {
    done();
  }
});

afterEach(restore);
