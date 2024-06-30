'use client';
import { type MyRpcApi } from '@/app/api/rpc/route';
import { createRpcClient } from '@/rpc-lib/client';
import { useState } from 'react';

const rpcClient = createRpcClient<MyRpcApi>();

const Home = () => {
  const [res, setRes] = useState<any>();

  return (
    <div>
      <button
        onClick={async () => {
          const userName = await rpcClient.user.name();
          const hello = await rpcClient.hello('Joey');

          setRes({ userNameRes: userName, helloRes: hello });
        }}
      >
        Run RPC
      </button>
      {res && (
        <div>
          <hr />
          Response:<pre>{JSON.stringify(res, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
export default Home;
