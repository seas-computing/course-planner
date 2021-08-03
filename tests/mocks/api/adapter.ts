import { Server } from 'http';
import request from 'supertest';
import { SuperAgentRequest } from 'superagent';
import {
  AxiosRequestConfig, AxiosResponse,
} from 'axios';

/**
 * This creates a mock adapter that replaces the underlying xhr/http request
 * method used by Axios with one based on supertest/superagent. This is
 * somewhat complicated as the two libraries have very different request and
 * response formats, but this should map the minimum number of fields necessary
 * to run tests of our client code against our actual API backend.
 *
 * To use in a test, you'll need to first initialize a NestJS testing module
 * then get a reference to the underlying HTTP server (as you would if using
 * supertest on its own). Then you'll need to import our `client/api/request`
 * axios instance and set it to use the return value of this function as its
 * default adapter:
 *
 *    const testModule = await Test.createTestingModule({
 *      ...
 *    }).compile();
 *    const nestApp = await testModule.init();
 *    const api = nestApp.getHttpServer();
 *    request.defaults.adapter = mockAdapter(api);
 *
 */
const mockAdapter = (app: Server) => async (
  config: AxiosRequestConfig
): Promise<AxiosResponse> => {
  const {
    method,
    url,
    data,
    headers,
    params,
  } = config;
  const mockApi = request(app);
  if (method in mockApi && typeof mockApi[method] === 'function') {
    const methodRequest = mockApi[method] as (url:string) => SuperAgentRequest;
    let stRequest = methodRequest(url);
    if (headers) {
      Object.entries(headers).forEach(([key, value]: [string, string]) => {
        stRequest = stRequest.set(key, value);
      });
    }
    if (['post', 'put'].includes(method)) {
      stRequest = stRequest.send(data);
    }
    if (params) {
      stRequest = stRequest.query(params);
    }
    const result = await stRequest;
    if (result.error) {
      const fakeAxiosError = Object.assign(
        result.error,
        {
          config,
          code: result.statusCode,
          response: result,
          isAxiosError: true,
          toJSON: () => JSON.parse,
        }
      );
      throw fakeAxiosError;
    }
    return {
      config,
      data: result.body,
      status: result.statusCode,
      statusText: result.text,
      headers: result.headers,
    };
  }
};

export default mockAdapter;
