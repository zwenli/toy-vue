import { initMixin } from './mixin'
import { ASSETS_TYPE } from '../shared/constants'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { initUse } from './use'
import { set, del } from '../obserber/index'
import { nextTick } from '../util/next-tick'
import { observe } from '../obserber/index'
import { extend } from '../shared/util'

export function initGlobalAPI(Vue) {
  // vue config
  // Vue.config = {}
  
  // util
  Vue.util = {
    extend
  }
  
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick
  
  // 将传入的数据变成响应式对象，可用于制造全局变量在组件共享数据
  Vue.observable = (obj) => {
    observe(obj)
    return obj
  }
  
  // options 是用来存放组件、指令、过滤器等的容器
  Vue.options = Object.create(null)
  ASSETS_TYPE.forEach((type) => {
    Vue.options[type + 's'] = {}
  })
  Vue.options._base = Vue //_base指向Vue
  
  // TODO: 内置组件注册
  // extend(Vue.options.components, builtInComponents);
  initUse(Vue) // Vue.use 用于插件的注册
  initMixin(Vue) // Vue.mixin，将属性/方法混入到Vue的原型中，一般用于提取全局的公共方法和属性
  initExtend(Vue) // Vue.extend，组件构造器，Vue组件的创建依赖此api，原理是利用原型继承的方式创建继承自Vue的子类
  initAssetRegisters(Vue) // component, directive, filter
}