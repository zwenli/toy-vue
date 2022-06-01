import { isNative } from './env'

const callbacks = []
let pending = false

function flushCallbacks() {
  pending = false //把标志还原为false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  // 依次执行回调
  for (let i = 0; i < copies.length; i += 1) {
    copies[i]()
  }
}

let timerFunc //定义异步方法  采用优雅降级

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  // 如果浏览器支持Promise 并且有native Promise
  // 那么就使用native Promise
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
  }
} else if (typeof MutationObserver !== 'undefined' && isNative(MutationObserver)) {
  // 如果浏览器支持MutationObserver 并且有native MutationObserver
  // 那么就使用native MutationObserver
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // 如果浏览器支持 setImmediate
  // 那么使用 setImmediate
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // 最后降级采用 setTimeout
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

/**
 * 
 * @param {Function} cb 
 * @param {?object} ctx 
 */
export function nextTick(cb, ctx) {
  // TODO: 支持 promise
  callbacks.push(() => {
    cb.call(ctx)
  })
  if (!pending) {
    // 如果多次调用nextTick,只会执行一次异步
    // 等异步队列清空之后再把标志变为false
    pending = true
    timerFunc()
  }
}