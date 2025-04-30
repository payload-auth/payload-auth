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
export function set<T extends Record<string, unknown>, V = unknown>(target: T, rawPath: string, value: V): T {
  if (!rawPath) return target

  const tokens = rawPath.split('.')
  let node: any = target

  for (let i = 0; i < tokens.length; i += 1) {
    const raw = tokens[i]
    const prepend = raw.startsWith('[]')
    const append = raw.endsWith('[]')
    const idxMatch = raw.match(/\[(\d+)]$/)
    const hasIndex = Boolean(idxMatch)
    const index = hasIndex ? Number(idxMatch![1]) : -1
    const key = prepend ? raw.slice(2) : append ? raw.slice(0, -2) : hasIndex ? raw.slice(0, raw.length - idxMatch![0].length) : raw
    const last = i === tokens.length - 1

    /* ----- prepend / append ------------------------------------------------ */
    if (prepend || append) {
      if (!Array.isArray(node[key])) node[key] = []
      if (last) {
        prepend ? (node[key] as any[]).unshift(value) : (node[key] as any[]).push(value)
        return target
      }
      const next: Record<string, unknown> = {}
      prepend ? (node[key] as any[]).unshift(next) : (node[key] as any[]).push(next)
      node = next
      continue
    }

    /* ----- explicit numeric index ----------------------------------------- */
    if (hasIndex) {
      if (!Array.isArray(node[key])) node[key] = []
      const arr: any[] = node[key] as any[]
      while (arr.length <= index) arr.push(undefined)
      if (last) {
        arr[index] = value
        return target
      }
      if (arr[index] === undefined) arr[index] = {}
      node = arr[index]
      continue
    }

    /* ----- plain object step ---------------------------------------------- */
    if (last) {
      node[key] = value
      return target
    }
    if (node[key] === undefined) node[key] = {}
    node = node[key]
  }

  return target
}
