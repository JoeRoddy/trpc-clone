# tRPC clone (in under 50 lines of code)

[tRPC](https://trpc.io/) enables typesafe, remote function execution of server code from the client side.

This repo is a proof of concept replication of tRPC using a JavaScript proxy, in [under 50 lines of code](./src/rpc-lib/).

This is just a fun and naive implementation of RPC's in TypeScript, tRPC likely solves thousands of small problems that this solution will not address.

### Codesandbox Demo

https://githubbox.com/JoeRoddy/trpc-clone

- tRPC-esque "library" at [./src/rpc-lib](./src/rpc-lib/)

Implementation - simple Next.js example usage:

- API code at [./src/app/api/rpc/route.ts](./src/app/api/rpc/route.ts)
- Client code at [./src/app/page.tsx](./src/app/page.tsx)

## How It's Used

- example server:

  ```ts
  import { handleRpcRequest } from 'rpc-lib/server';
  // my-server.ts
  const myApi = {
    foo: {
      bar: ({ a }: { a: number }) => a * 2,
    },
    hello: () => 'hello world!',
  };

  app.post('/api/rpc', async (req, res) => {
    const { path, args } = req.body;
    const res = await handleRpcRequest({ api: myApi, req: { path, args } });
    res.status(200).json(res);
  });

  export type MyApiType = typeof myApi;
  ```

- example client:

  ```ts
  // my-client.ts
  import { createRpcClient } from 'rpc-lib/client';
  import { type MyApiType } from './my-server.ts';

  // infer types from generic
  const client = createRpcClient<MyApiType>();

  const result = await client.foo.bar({ a: 1 });
  ```

  - the client uses some TS type magic to infer the appropriate types from the structure of your API via the generic passed `createRpcClient<MyApiType>`

![type completion](./example-images/type-completion.png)

## How it works under the hood

### The Client

[The client](./src/rpc-lib/client/index.ts) uses a [JavaScript proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that can accept any dynamic function call and executes it as an equivalent POST request.

```ts
const result = await client.foo.bar({ a: 1 });
// gets executed as
POST /api/rpc -d "{ path: ['foo', 'bar'], args: { a: 1 } }"
```

This will magically work for any call, even if you haven't defined the function on your API:

```ts
await func.doesnt.exist({ exists: false })
// gets executed as
POST /api/rpc -d "{ path: ['func','doesnt','exist'], args: { exists: false } }"
```

This will throw an error on the server, but it will make the request.

Here's the client implementation:

```ts
// rpc-lib/client/index.ts
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
```

### The Server

The server exposes `handleRpcRequest()` - a simple implementation that takes the incoming request (`path` and `args`), and an API object, and invokes the function at the given path (or returns any non-func as a value):

```ts
// rpc-lib/server/index.ts
type ApiLeafValue = Function | string | number | boolean | null | undefined;
type RpcApi = { [key: string]: RpcApi | ApiLeafValue };

export const handleRpcRequest = ({
  api,
  req,
}: {
  api: RpcApi;
  req: { path: string[]; args: any[] };
}) => {
  const apiLeaf = req.path.reduce(
    (acc: RpcApi | ApiLeafValue, key) =>
      typeof acc === 'object' ? acc?.[key] : acc,
    api,
  );
  if (!apiLeaf) throw new Error(`Invalid path ${req.path.join('.')}`);
  return typeof apiLeaf === 'function' ? apiLeaf(...req.args) : apiLeaf;
};
```

### End to end type safety

The above explains how remote calling works from a JS perspective, but how do we get end to end type safety to work?

You may have noticed, the `createRpcClient` function has a return type of `TransformApi<T>`:

```ts
export function createRpcClient<T extends object>(path = []): TransformApi<T>;
```

^ This is doing the heavy lifting of mimicking our API object's types, but changing each individual property to being a function that returns a Promise.

Here's the type implementation that makes that happen.

```ts
// rpc-lib/client/index.ts
type Primitive = string | number | boolean | null | undefined;
type TransformApi<T> = {
  [K in keyof T]: T[K] extends Primitive
    ? () => Promise<T[K]>
    : T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : TransformApi<T[K]>;
};
```

eg:

- prop of type `number` becomes `() => Promise<number>`
- prop of type `() => number` to `() => Promise<number>`
