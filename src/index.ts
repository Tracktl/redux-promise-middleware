import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from 'redux';

type Types = [string?, string?, string?];

interface Meta {
  [MetaImplementation: string]: {};
}

type Metas = [Meta?, Meta?, Meta?];

interface PromiseAction extends AnyAction {
  promise: string;
  types: Types;
  metas?: Metas;
}

interface ImplementationFn {
  (action: AnyAction, getState: () => any): Promise<any>;
}

export interface Implementations extends Map<string, ImplementationFn> {}

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
  const { types, metas = [], meta, ...rest } = action;

  const promise = implementation(rest, store.getState);

  const [PENDING, SUCCESS, FAILURE] = types;
  const [pendingMeta, successMeta, failureMeta] = metas;

  const callAction = (type: string, typeMeta?: {}, typeData?: {}) =>
    next({
      ...rest,
      ...typeData,
      type,
      meta: typeMeta,
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
    if (action.promise === undefined) return next(action);

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
