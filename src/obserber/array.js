
// 先保留数组原型
const arrayProto = Array.prototype
// 然后将arrayMethods继承自数组原型
// 这里是面向切片编程思想（AOP）--不破坏封装的前提下，动态的扩展功能
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'reverse',
  'sort',
]

methodsToPatch.forEach((method) => {
  arrayMethods[method] = function (...args) {
    // 这里保留原型方法的执行结果
    const result = arrayProto[method].apply(this, args)
    // this 就是数据本身，获取数据对应的 obverser 实例
    const ob = this.__ob__
     // 这里的标志就是代表数组有新增操作
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2)
        break;
      default:
        break;
    }
    // 如果有新增的元素 inserted是一个数组 调用Observer实例的observeArray对数组每一项进行观测
    if (inserted) {
      ob.observeArray(inserted)
    }
    // 通知变更
    ob.dep.notify()
    return result
  }
})
