'use client';
import { type rpcApi } from '@/api';
import { createRpcClient } from '@/my-rpc-lib/client';

const rpcClient = createRpcClient<typeof rpcApi>();

export { rpcClient };
