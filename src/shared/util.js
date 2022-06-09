export function isDef(val) {
  return val !== undefined && val !== null
}

export function isUndef(val) {
  return val === undefined || val === null
}

export function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

export function isObject(v) {
  return v !== null && typeof v === 'object'
}

const _toString = Object.prototype.toString

export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]'
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key)
}

export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

export function noop() {}