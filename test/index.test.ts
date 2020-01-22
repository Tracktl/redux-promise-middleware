import promiseMiddleware, { Implementations, ImplementationFn } from '../src';

const implementations: Implementations = new Map<string, ImplementationFn>([
  [
    'FAKE',
    async ({ eventName, payload, data }) => {
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
