const checkAction = (types, metas, meta) => {
  // check `types`
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error("Expected an array of three action types.");
  }

  if (
    !types.every(
      type =>
        type === null || typeof type === "string" || typeof type === "object"
    )
  ) {
    throw new Error("Expected action types to be strings, objects or null.");
  }

  // check `metas`
  if (metas !== undefined && (!Array.isArray(metas) || metas.length !== 3)) {
    throw new Error("Expected metas to be an array of three values.");
  }

  // check `meta` confusion with `metas`
  if (Array.isArray(meta)) {
    throw new Error("Expected `meta` to be an object.");
  }
};

const callImplementation = (store, implementation, action, next) => {
  const { types, metas, meta, ...rest } = action;

  const promise = implementation(rest, store.getState);

  const [PENDING, SUCCESS, FAILURE] = types;
  const [pendingMeta, successMeta, failureMeta] = metas || [];

  const callAction = (type, typeMeta, typeData) =>
    next({
      ...rest,
      ...typeData,
      type,
      meta: typeMeta
    });

  if (PENDING !== null) {
    callAction(PENDING, pendingMeta);
  }

  return promise.then(
    SUCCESS &&
      (payload =>
        Promise.resolve(callAction(SUCCESS, successMeta, { payload })).then(
          () => payload
        )),
    FAILURE &&
      (error => {
        Promise.resolve(callAction(FAILURE, failureMeta, { error })).then(
          () => {
            throw error;
          }
        );
      })
  );
};

export default function promiseMiddleware(implementations) {
  return store => next => action => {
    if (action.promise === undefined) return next(action);
    const implementation = implementations.get(action.promise);

    if (process.env.NODE_ENV !== "production" && !implementation) {
      throw new Error(`Invalid promise value: "${action.promise}"`);
    }

    if (process.env.NODE_ENV !== "production") {
      checkAction(action.types, action.metas, action.meta);
    }

    return callImplementation(store, implementation, action, next);
  };
}
