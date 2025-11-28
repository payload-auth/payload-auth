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
 */ export function set(target, rawPath, value) {
    if (!rawPath) return target;
    const tokens = rawPath.split('.');
    let node = target;
    for(let i = 0; i < tokens.length; i += 1){
        const raw = tokens[i];
        const prepend = raw.startsWith('[]');
        const append = raw.endsWith('[]');
        const idxMatch = raw.match(/\[(\d+)]$/);
        const hasIndex = Boolean(idxMatch);
        const index = hasIndex ? Number(idxMatch[1]) : -1;
        const key = prepend ? raw.slice(2) : append ? raw.slice(0, -2) : hasIndex ? raw.slice(0, raw.length - idxMatch[0].length) : raw;
        const last = i === tokens.length - 1;
        /* ----- prepend / append ------------------------------------------------ */ if (prepend || append) {
            if (!Array.isArray(node[key])) node[key] = [];
            if (last) {
                prepend ? node[key].unshift(value) : node[key].push(value);
                return target;
            }
            const next = {};
            prepend ? node[key].unshift(next) : node[key].push(next);
            node = next;
            continue;
        }
        /* ----- explicit numeric index ----------------------------------------- */ if (hasIndex) {
            if (!Array.isArray(node[key])) node[key] = [];
            const arr = node[key];
            while(arr.length <= index)arr.push(undefined);
            if (last) {
                arr[index] = value;
                return target;
            }
            if (arr[index] === undefined) arr[index] = {};
            node = arr[index];
            continue;
        }
        /* ----- plain object step ---------------------------------------------- */ if (last) {
            node[key] = value;
            return target;
        }
        if (node[key] === undefined) node[key] = {};
        node = node[key];
    }
    return target;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9iZXR0ZXItYXV0aC9wbHVnaW4vdXRpbHMvc2V0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRGVlcC1zZXRzIGEgdmFsdWUgb24gYW4gb2JqZWN0IHVzaW5nIGEgZG90dGVkLXBhdGggc3RyaW5nLlxuICpcbiAqICoqUGF0aCBzeW50YXgqKlxuICog4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gKiAgIHRva2VuICAgICAgICBhY3Rpb25cbiAqICAgLS0tLS0tLS0tLS0tIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICBgZm9vLmJhcmAgICAgY3JlYXRlL3JlYWQgcGxhaW4gbmVzdGVkIG9iamVjdHNcbiAqICAgYGZvby5iYXJbXWAgICphcHBlbmQqIGB2YWx1ZWAgdG8gYXJyYXkgYGZvby5iYXJgXG4gKiAgIGBmb28uW11iYXJgICAqcHJlcGVuZCogYHZhbHVlYCB0byBhcnJheSBgZm9vLmJhcmBcbiAqICAgYGZvby5iYXJbMl1gIHJlcGxhY2UgaXRlbSBgMmAgb2YgYGZvby5iYXJgLCBjcmVhdGluZ1xuICogICAgICAgICAgICAgICAgZW1wdHkgc2xvdHMgaWYgdGhlIGluZGV4IGlzIG91dCBvZiBib3VuZHNcbiAqXG4gKiBNaXNzaW5nIG9iamVjdHMvYXJyYXlzIGFyZSBjcmVhdGVkIG9uIHRoZSBmbHkuXG4gKiBUaGUgZnVuY3Rpb24gbXV0YXRlcyBgdGFyZ2V0YCBpbiBwbGFjZSBhbmQgcmV0dXJucyBpdCBzb1xuICogeW91IGNhbiBjaGFpbiBjYWxscy5cbiAqXG4gKiBAdHlwZVBhcmFtIFQg4oCTIHRhcmdldCBvYmplY3QgdHlwZVxuICogQHR5cGVQYXJhbSBWIOKAkyB2YWx1ZSB0eXBlXG4gKiBAcGFyYW0gdGFyZ2V0ICAgT2JqZWN0IHRvIG11dGF0ZVxuICogQHBhcmFtIHJhd1BhdGggIERvdHRlZCBwYXRoIHN0cmluZyAoc2VlIHN5bnRheCB0YWJsZSlcbiAqIEBwYXJhbSB2YWx1ZSAgICBWYWx1ZSB0byBzZXQgLyBhcHBlbmQgLyBwcmVwZW5kXG4gKiBAcmV0dXJucyAgICAgICAgVGhlIG9yaWdpbmFsIGB0YXJnZXRgIHJlZmVyZW5jZVxuICpcbiAqIEBleGFtcGxlXG4gKiBjb25zdCBvOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9O1xuICogc2V0KG8sICdhbHBoYS5iZXRhWzJdLmdhbW1hJywgNDIpO1xuICogLy8gbyDihpJcbiAqIC8vIHtcbiAqIC8vICAgYWxwaGE6IHtcbiAqIC8vICAgICBiZXRhOiBbXG4gKiAvLyAgICAgICAsICAgICAgICAgICAgICAgLy8gPC0tIGVtcHR5IHNsb3QgIzBcbiAqIC8vICAgICAgICwgICAgICAgICAgICAgICAvLyA8LS0gZW1wdHkgc2xvdCAjMVxuICogLy8gICAgICAgeyBnYW1tYTogNDIgfSAgIC8vIDwtLSBzbG90ICMyXG4gKiAvLyAgICAgXVxuICogLy8gICB9XG4gKiAvLyB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQ8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBWID0gdW5rbm93bj4odGFyZ2V0OiBULCByYXdQYXRoOiBzdHJpbmcsIHZhbHVlOiBWKTogVCB7XG4gIGlmICghcmF3UGF0aCkgcmV0dXJuIHRhcmdldFxuXG4gIGNvbnN0IHRva2VucyA9IHJhd1BhdGguc3BsaXQoJy4nKVxuICBsZXQgbm9kZTogYW55ID0gdGFyZ2V0XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBjb25zdCByYXcgPSB0b2tlbnNbaV1cbiAgICBjb25zdCBwcmVwZW5kID0gcmF3LnN0YXJ0c1dpdGgoJ1tdJylcbiAgICBjb25zdCBhcHBlbmQgPSByYXcuZW5kc1dpdGgoJ1tdJylcbiAgICBjb25zdCBpZHhNYXRjaCA9IHJhdy5tYXRjaCgvXFxbKFxcZCspXSQvKVxuICAgIGNvbnN0IGhhc0luZGV4ID0gQm9vbGVhbihpZHhNYXRjaClcbiAgICBjb25zdCBpbmRleCA9IGhhc0luZGV4ID8gTnVtYmVyKGlkeE1hdGNoIVsxXSkgOiAtMVxuICAgIGNvbnN0IGtleSA9IHByZXBlbmQgPyByYXcuc2xpY2UoMikgOiBhcHBlbmQgPyByYXcuc2xpY2UoMCwgLTIpIDogaGFzSW5kZXggPyByYXcuc2xpY2UoMCwgcmF3Lmxlbmd0aCAtIGlkeE1hdGNoIVswXS5sZW5ndGgpIDogcmF3XG4gICAgY29uc3QgbGFzdCA9IGkgPT09IHRva2Vucy5sZW5ndGggLSAxXG5cbiAgICAvKiAtLS0tLSBwcmVwZW5kIC8gYXBwZW5kIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuICAgIGlmIChwcmVwZW5kIHx8IGFwcGVuZCkge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG5vZGVba2V5XSkpIG5vZGVba2V5XSA9IFtdXG4gICAgICBpZiAobGFzdCkge1xuICAgICAgICBwcmVwZW5kID8gKG5vZGVba2V5XSBhcyBhbnlbXSkudW5zaGlmdCh2YWx1ZSkgOiAobm9kZVtrZXldIGFzIGFueVtdKS5wdXNoKHZhbHVlKVxuICAgICAgICByZXR1cm4gdGFyZ2V0XG4gICAgICB9XG4gICAgICBjb25zdCBuZXh0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9XG4gICAgICBwcmVwZW5kID8gKG5vZGVba2V5XSBhcyBhbnlbXSkudW5zaGlmdChuZXh0KSA6IChub2RlW2tleV0gYXMgYW55W10pLnB1c2gobmV4dClcbiAgICAgIG5vZGUgPSBuZXh0XG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIC8qIC0tLS0tIGV4cGxpY2l0IG51bWVyaWMgaW5kZXggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbiAgICBpZiAoaGFzSW5kZXgpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShub2RlW2tleV0pKSBub2RlW2tleV0gPSBbXVxuICAgICAgY29uc3QgYXJyOiBhbnlbXSA9IG5vZGVba2V5XSBhcyBhbnlbXVxuICAgICAgd2hpbGUgKGFyci5sZW5ndGggPD0gaW5kZXgpIGFyci5wdXNoKHVuZGVmaW5lZClcbiAgICAgIGlmIChsYXN0KSB7XG4gICAgICAgIGFycltpbmRleF0gPSB2YWx1ZVxuICAgICAgICByZXR1cm4gdGFyZ2V0XG4gICAgICB9XG4gICAgICBpZiAoYXJyW2luZGV4XSA9PT0gdW5kZWZpbmVkKSBhcnJbaW5kZXhdID0ge31cbiAgICAgIG5vZGUgPSBhcnJbaW5kZXhdXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIC8qIC0tLS0tIHBsYWluIG9iamVjdCBzdGVwIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cbiAgICBpZiAobGFzdCkge1xuICAgICAgbm9kZVtrZXldID0gdmFsdWVcbiAgICAgIHJldHVybiB0YXJnZXRcbiAgICB9XG4gICAgaWYgKG5vZGVba2V5XSA9PT0gdW5kZWZpbmVkKSBub2RlW2tleV0gPSB7fVxuICAgIG5vZGUgPSBub2RlW2tleV1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXRcbn1cbiJdLCJuYW1lcyI6WyJzZXQiLCJ0YXJnZXQiLCJyYXdQYXRoIiwidmFsdWUiLCJ0b2tlbnMiLCJzcGxpdCIsIm5vZGUiLCJpIiwibGVuZ3RoIiwicmF3IiwicHJlcGVuZCIsInN0YXJ0c1dpdGgiLCJhcHBlbmQiLCJlbmRzV2l0aCIsImlkeE1hdGNoIiwibWF0Y2giLCJoYXNJbmRleCIsIkJvb2xlYW4iLCJpbmRleCIsIk51bWJlciIsImtleSIsInNsaWNlIiwibGFzdCIsIkFycmF5IiwiaXNBcnJheSIsInVuc2hpZnQiLCJwdXNoIiwibmV4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