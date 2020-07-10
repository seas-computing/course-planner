import { restore } from 'sinon';

before(function () {
  process.env.NODE_ENV = 'testing';
  process.env.SERVER_URL = '';
});

after(function () {
  Object.keys(require.cache).forEach((key) => {
    delete require.cache[key];
  })
});

afterEach(restore);
