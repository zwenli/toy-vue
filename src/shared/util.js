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

function pollyfillBind(fn, ctx) {
  function boundFn (a) {
    const l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length
  return boundFn
}

function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}
export const bind = Function.prototype.bind ? nativeBind : pollyfillBind

export function noop() {}