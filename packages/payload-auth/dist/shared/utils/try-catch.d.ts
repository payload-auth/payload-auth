type Success<T> = {
    data: T;
    error: null;
};
type Failure<E> = {
    data: null;
    error: E;
};
type Result<T, E = Error> = Success<T> | Failure<E>;
export declare function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>>;
export {};
//# sourceMappingURL=try-catch.d.ts.map