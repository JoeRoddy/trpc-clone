'use client';
import { rpcClient } from '@/client';
import { useState } from 'react';

export default function Home() {
  const [res, setRes] = useState<any>();

  return (
    <div>
      <button
        onClick={async () => {
          const user = await rpcClient.user();
          console.log('user', user);

          const name = await rpcClient.user.name();
          console.log('name', name);

          const hello = await rpcClient.hello('Joey');
          console.log('hello', hello);

          setRes(hello);
        }}
      >
        Run RPC
      </button>
      {res && (
        <div>
          <hr />
          Response:
          <pre>{JSON.stringify(res, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
