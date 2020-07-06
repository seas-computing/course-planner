import axios from 'axios';

export * from 'axios';
export default axios.create({
  // @ts-ignore: Will be replaced by Webpack
  // eslint-disable-next-line no-undef
  baseURL: __SERVER_URL__,
});
