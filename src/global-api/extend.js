import { mergeOptions } from '../util/options'

export function initExtend(Vue) {
  Vue.cid = 0
  let cid = 1
  // 创建子类继承Vue父类 便于属性扩展
  Vue.extend = function(extendOptions) {
    extendOptions = extendOptions || {}
    
    const Super = this
    const SuperId = Super.cid
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
    const Sub = function VueComponent(options) {
      // 创建子类的构造函数 并且调用初始化方法
      this._init(options)
    }
    Sub.prototype = Object.create(this.prototype) // 子类原型指向父类
    Sub.prototype.constructor = Sub //constructor指向自己
    Sub.cid = cid++
    Sub.options = mergeOptions(this.options, extendOptions) //合并自己的options和父类的options
    Sub['super'] = Super
    
    // TODO: 子类的初始化工作

    // 缓存起构造函数，如果不这么处理，组件中components的子组件每次update都会创建新的构造函数
    cachedCtors[SuperId] = Sub
    return Sub
  }
}