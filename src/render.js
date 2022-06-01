import { createElement, createTextVNode } from './vdom/index'
import { nextTick } from './util/next-tick'

export function renderMixin(Vue) {
  // 挂载到原型的nextTick方法
  Vue.prototype.$nextTick = function(fn) {
    return nextTick(fn, this)
  }
  
  Vue.prototype._render = function() {
    const vm = this
    const { render } = vm.$options
    // 生成vnode -- 虚拟dom
    const vnode = render.call(vm, vm.$createElement)
    return vnode
  }
  // vue源码中$createElement 与 _c 是有区别的，前者是用户使用
  // 后者是template编译中使用
  Vue.prototype.$createElement = function(a, b, c) {
    return createElement(a, b, c)
  }
  
  Vue.prototype._c = function(a, b, c) {
    // 创建虚拟dom元素
    return createElement(a, b, c)
  }
  Vue.prototype._v = function(text) {
    // 创建文本节点
    return createTextVNode(text)
  }
  Vue.prototype._s = function(val) {
    // 如果模板里面的是一个对象  需要JSON.stringify
    return val == null
      ? ''
      : typeof val === 'object'
      ? JSON.stringify(val)
      : val
  }
}