export type Result<T, E extends Error> = Success<T> | Failure<E>;

export type PromiseResult<T, E extends Error> = Promise<Result<T, E>>;

export class Success<T> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<Error> {
    return false;
  }
}

export class Failure<E extends Error> {
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  isSuccess(): this is Success<unknown> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }
}

export const unwrap = <T, E extends Error>(result: Result<T, E>): T => {
  if (result.isFailure()) {
    throw result.error;
  }
  return result.value;
};

export const success = <T>(value: T) => new Success(value);

export const failure = <E extends Error>(error: E) => new Failure(error);

export const tryCatch = <T, E extends Error>(
  func: () => T,
  // 発生する例外は any なので適切な型に変換するための
  // 関数を与える。
  onCatch: (e: unknown) => E,
): Result<T, E> => {
  try {
    const value = func();
    return new Success<T>(value);
  } catch (err) {
    return new Failure<E>(onCatch(err));
  }
};

export const tryCatchAsync = async <T, E extends Error>(
  func: () => Promise<T>,
  // 発生する例外は any なので適切な型に変換するための
  // 関数を与える。
  onCatch: (e: unknown) => E,
): PromiseResult<T, E> => {
  try {
    const value = await func();
    return new Success<T>(value);
  } catch (err) {
    return new Failure<E>(onCatch(err));
  }
};

export const promiseAll = <T, E extends Error>(
  // 本来の Promise.all() は PromiseLike や非 Promise な値も
  // 受け付けますが簡単のために PromiseResult の配列に限定しています。
  values: readonly PromiseResult<T, E>[],
): PromiseResult<T[], E> => {
  return new Promise<Result<T[], E>>((resolve, reject) => {
    const results: T[] = [];
    for (const v of values) {
      v.then((result) => {
        if (result.isFailure()) {
          resolve(result);
          return;
        }
        results.push(result.value);

        if (results.length === values.length) {
          resolve(new Success(results));
        }
      }).catch(reject);
    }
  });
};
