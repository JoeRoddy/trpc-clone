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
