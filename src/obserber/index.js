import { isPlainObject, hasOwn, isObject } from '../shared/util'
import { Dep } from './dep'
import { arrayMethods } from './array'
class Obserber {
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    Object.defineProperty(value, '__ob__', {
      value: this,
      enumerable: false, // 不可枚举
      writable: true,
      configurable: true,
    })
    if (Array.isArray(value)) {
      // 通过重写数组原型方法来对数组的七种方法进行拦截
      value.__proto__ = arrayMethods
      // 如果数组里面还包含数组 需要递归判断
      this.observeArray(value)
    } else {
      // 对象上的所有属性依次进行观测
      this.walk(value)
    }
  }
  // 对数组进行观测，这里可看出，利用索引直接设置一个数组项时是不能检测到变动的，
  // 需要改成splice(index, 1, newVal)、或 set(arr, index, newVal)
  observeArray(items) {
    for (let i = 0; i < items.length; i += 1) {
      observe(items[i])
    }
  }
  // 对对象上的所有属性依次进行观测
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i]
      const value = obj[key]
      defineReactive(obj, key, value)
    }
  }
}

// 数据劫持核心
function defineReactive(obj, key, value) {
  const dep = new Dep()
  // 递归关键
  let childOb = observe(value)
  Object.defineProperty(obj, key, {
    get: function reactiveGetter() {
      // 依赖收集
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
      }
      return value
    },
    set: function reactiveSetter(newValue) {
      if (value === newValue) {
        return
      }
      value = newValue
      childOb = observe(value)
      // 派发更新
      dep.notify()
    }
  })
}

export function observe(value) {
  // 非对象值不进行观测
  if (!isObject(value)) {
    return
  }
  let ob
  // 如果已经是观测的，直接返回
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Obserber) {
    ob = value.__ob__
  } else if (isPlainObject(value) || Array.isArray(value)) {
    ob = new Obserber(value)
  }
  return ob
}