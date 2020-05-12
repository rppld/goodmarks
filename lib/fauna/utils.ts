export function flattenDataKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map((e) => flattenDataKeys(e))
  } else if (typeof obj === 'object') {
    // The case where we have just data pointing to an array.
    if (Object.keys(obj).length === 1 && obj.data && Array.isArray(obj.data)) {
      return flattenDataKeys(obj.data)
    } else {
      Object.keys(obj).forEach((k) => {
        if (k === 'ref') {
          // Return plain `id` instead of `ref` object.
          const r = obj[k]
          delete obj.ref
          obj['id'] = r.id
        }
        if (k === 'data') {
          const d = obj[k]
          delete obj.data

          Object.keys(d).forEach((dataKey) => {
            obj[dataKey] = flattenDataKeys(d[dataKey])
          })
        } else {
          obj[k] = flattenDataKeys(obj[k])
        }
      })
    }
    return obj
  } else {
    return obj
  }
}
