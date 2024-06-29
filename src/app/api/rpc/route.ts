import { rpcApi } from '@/api';
import { handleRequest } from '@/my-rpc-lib/server';
import { NextResponse } from 'next/server';

export async function POST(reqest: Request) {
  const res = await handleRequest({ api: rpcApi, req: await reqest.json() });
  return NextResponse.json(res);
}
