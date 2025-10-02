/**
 * Returns the provided value if it's defined (not undefined), otherwise returns the default value.
 * Unlike null checks, this allows empty strings to pass through.
 *
 * @param value - The value to check
 * @param defaultValue - The default value to return if the provided value is undefined
 * @returns The provided value if defined, otherwise the default value
 */
export declare function valueOrDefaultString<T extends string>(value: T | undefined, defaultValue: T): T;
//# sourceMappingURL=value-or-default.d.ts.map