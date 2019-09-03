import { AnyAction } from 'redux';
import promiseMiddleware from '../src';

const implementations: any = new Map([
  [
    'FAKE',
    async ({ eventName, payload, data }: AnyAction) => {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof eventName !== 'string') {
          throw new Error('Expected eventName to be a string.');
        }

        if (payload && !data) {
          throw new Error('Expecting data, not payload.');
        }
      }

      return data;
    },
  ],
]);

describe('Promise Middleware', () => {
  it('works', () => {
    const middleware = promiseMiddleware(implementations);
    console.log(middleware);
  });
});
