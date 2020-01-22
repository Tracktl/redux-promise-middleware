export type Types = [string?, string?, string?];

export interface Meta {
  [MetaImplementation: string]: {};
}

export type Metas = [Meta?, Meta?, Meta?];

export interface PromiseActionExtra {
  [extraProps: string]: any;
}

export interface PromiseAction extends PromiseActionExtra {
  promise: string;
  types: Types;
  metas?: Metas;
}

export type ImplementationFn = (
  action: PromiseActionExtra,
  getState: () => any,
) => Promise<any>;

export interface Implementations extends Map<string, ImplementationFn> {}
