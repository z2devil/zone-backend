async function silentHandle<T, U = Error>(
    fn: Function,
    ...args: Array<unknown>
): Promise<[U, null] | [null, T]> {
    let result: [U, null] | [null, T];

    try {
        result = [null, await fn(...args)];
    } catch (e: any) {
        result = [e, null];
    }

    return result;
}

async function throwHandle(
    fn: Function,
    ...args: Array<unknown>
): Promise<any> {
    let result: any;

    try {
        result = await fn(...args);
    } catch (e: any) {
        throw new Error(e.message);
    }

    return result;
}

export { throwHandle, silentHandle };
