async function silentHandle<
  Args extends Array<unknown>,
  Res,
  Err extends Error
>(
  fn: (...args: Args) => Promise<Res> | Res,
  ...args: Args
): Promise<[Err, null] | [null, Res]> {
  let result: [Err, null] | [null, Res];

  try {
    result = [null, await fn(...args)];
  } catch (e: any) {
    result = [e, null];
  }

  return result;
}

async function throwHandle<Args extends Array<unknown>, Res>(
  fn: (...args: Args) => Promise<Res>,
  ...args: Args
): Promise<Res> {
  let result: Res;

  try {
    result = await fn(...args);
  } catch (e: any) {
    throw new Error(e.message);
  }

  return result;
}

export { throwHandle, silentHandle };
