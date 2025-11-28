/**
 * Deep-sets a value on an object using a dotted-path string.
 *
 * **Path syntax**
 * ──────────────────────────────────────────────────────────
 *   token        action
 *   ------------ ------------------------------------------
 *   `foo.bar`    create/read plain nested objects
 *   `foo.bar[]`  *append* `value` to array `foo.bar`
 *   `foo.[]bar`  *prepend* `value` to array `foo.bar`
 *   `foo.bar[2]` replace item `2` of `foo.bar`, creating
 *                empty slots if the index is out of bounds
 *
 * Missing objects/arrays are created on the fly.
 * The function mutates `target` in place and returns it so
 * you can chain calls.
 *
 * @typeParam T – target object type
 * @typeParam V – value type
 * @param target   Object to mutate
 * @param rawPath  Dotted path string (see syntax table)
 * @param value    Value to set / append / prepend
 * @returns        The original `target` reference
 *
 * @example
 * const o: Record<string, unknown> = {};
 * set(o, 'alpha.beta[2].gamma', 42);
 * // o →
 * // {
 * //   alpha: {
 * //     beta: [
 * //       ,               // <-- empty slot #0
 * //       ,               // <-- empty slot #1
 * //       { gamma: 42 }   // <-- slot #2
 * //     ]
 * //   }
 * // }
 */
export declare function set<T extends Record<string, unknown>, V = unknown>(target: T, rawPath: string, value: V): T;
//# sourceMappingURL=set.d.ts.map