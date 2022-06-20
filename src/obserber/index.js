import { isPlainObject, hasOwn, isObject, isValidArrayIndex } from '../shared/util'
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

// 数据劫持核心
function defineReactive(obj, key, value) {
  const dep = new Dep()
  // 递归关键
  // childOb就是Observer实例
  let childOb = observe(value)
  Object.defineProperty(obj, key, {
    get: function reactiveGetter() {
      // 依赖收集
      if (Dep.target) {
        // 如果有watcher dep就会保存watcher 同时watcher也会保存dep
        dep.depend()
        if (childOb) {
          // 这里表示 属性的值依然是一个对象，包含数组和对象
          // childOb指代的就是Observer实例对象，里面的dep进行依赖收集
          // 比如{a:[1,2,3]} 属性a对应的值是一个数组 观测数组的返回值就是对应数组的Observer实例对象
          childOb.dep.depend()
          if (Array.isArray(childOb)) {
            // 如果数据结构类似 {a:[1,2,[3,4,[5,6]]]} 这种数组多层嵌套，数组包含数组的情况
            // 那么我们访问a的时候，只是对第一层的数组进行了依赖收集，里面的数组因为没访问到
            // 所以没有收集依赖，但是如果我们改变了a里面的第二层数组的值，是需要更新页面的
            // 所以需要对数组递归进行依赖收集
            // 如果内部还是数组, 还需要不停的进行依赖收集
            dependArray(childOb)
          }
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

export function set(target, key, val) {
  // 如果是数组，直接调用重写的splice方法，可以刷新视图
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  // 如果是对象本身的属性，则直接添加即可
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  const ob = target.__ob__
  // 对象本身就不是响应式，不需要将其定义成响应式属性
  if (!ob) {
    target[key] = val
    return val
  }
  // 将新增的属性定义为响应式的
  defineReactive(target, key, val)
  ob.dep.notify()
  return val
}

export function del(target, key) {
  // 如果是数组，调用splice，原理set
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = target.__ob__
  // 对象本身不存在这个属性，不需要任何处理
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  // 如果对象不是响应式的，直接返回，无需派发更新
  if (!ob) {
    return
  }
  ob.dep.notify()
}

// 递归收集数组依赖
function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    // e.__ob__代表e已经被响应式观测了，把依赖收集到自己的Observer实例的dep里面
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      // 如果数组里面还有数组，继续递归去收集依赖
      dependArray(e)
    }
  }
}
