// @ts-nocheck
type Primitive = string | number | boolean | null | undefined;
type TransformApi<T> = {
  [K in keyof T]: T[K] extends Primitive
    ? () => Promise<T[K]>
    : T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : TransformApi<T[K]>;
};

export function createRpcClient<T extends object>(path = []): TransformApi<T> {
  return new Proxy<T>(() => {}, {
    get: (target, property) =>
      property === 'toString'
        ? () => path.join('.')
        : createRpcClient([...path, property]),
    apply: (target, thisArg, args) =>
      fetch('/api/rpc', {
        method: 'POST',
        body: JSON.stringify({ args, path }),
      }).then((res) => res.json()),
  });
}
