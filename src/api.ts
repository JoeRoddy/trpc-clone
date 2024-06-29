'server only';

export const rpcApi = {
  user: {
    name: 'John Snow',
  },
  hello: (name: string) => {
    return { message: `Hello ${name}!` };
  },
};
