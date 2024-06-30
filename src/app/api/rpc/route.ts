import { handleRpcRequest } from '@/rpc-lib/server';
import { NextResponse } from 'next/server';

const rpcApi = {
  user: {
    name: 'John Snow',
  },
  hello: (name: string) => {
    return { message: `Hello ${name}!` };
  },
};

export type MyRpcApi = typeof rpcApi;

export async function POST(request: Request) {
  const req = await request.json();
  const res = await handleRpcRequest({ api: rpcApi, req });
  return NextResponse.json(res);
}
