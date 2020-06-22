import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import {
  Types,
  Meta,
  Metas,
  PromiseAction,
  ImplementationFn,
  Implementations,
} from './types';

const checkAction = (types: Types, metas?: Metas, meta?: any) => {
  // check `types`
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.');
  }

  if (
    !types.every(
      type =>
        type === null || typeof type === 'string' || typeof type === 'object',
    )
  ) {
    throw new Error('Expected action types to be strings, objects or null.');
  }

  // check `metas`
  if (metas !== undefined && (!Array.isArray(metas) || metas.length !== 3)) {
    throw new Error('Expected metas to be an array of three values.');
  }

  // check `meta` confusion with `metas`
  if (Array.isArray(meta)) {
    throw new Error('Expected `meta` to be an object.');
  }
};

const callImplementation = (
  store: MiddlewareAPI,
  implementation: ImplementationFn,
  action: PromiseAction,
  next: Dispatch,
) => {
  const { types, metas = [], meta: _, ...rest } = action;

  const promise = implementation(rest, store.getState);

  const [PENDING, SUCCESS, FAILURE] = types;
  const [pendingMeta, successMeta, failureMeta] = metas;

  const callAction = (type: string, meta?: Meta, data?: {}) =>
    next({
      ...rest,
      ...data,
      type,
      meta,
    });

  if (PENDING) {
    callAction(PENDING, pendingMeta);
  }

  if (SUCCESS) {
    promise.then(payload =>
      Promise.resolve(callAction(SUCCESS, successMeta, { payload })).then(
        () => payload,
      ),
    );
  }

  if (FAILURE) {
    promise.catch(error =>
      Promise.resolve(callAction(FAILURE, failureMeta, { error })).then(() => {
        throw error;
      }),
    );
  }

  return promise;
};

export default function promise(implementations: Implementations) {
  const promiseMiddleware: Middleware = (store: MiddlewareAPI) => (
    next: Dispatch,
  ) => (action: PromiseAction) => {
    if (action.promise === undefined) {
      return next((action as unknown) as AnyAction);
    }

    const implementation = implementations.get(action.promise);

    if (!implementation) {
      throw new Error(`Invalid promise value: "${action.promise}"`);
    }

    if (process.env.NODE_ENV !== 'production') {
      checkAction(action.types, action.metas, action.meta);
    }

    return callImplementation(store, implementation, action, next);
  };

  return promiseMiddleware;
}

export * from './types';
