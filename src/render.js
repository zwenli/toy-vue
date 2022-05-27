import { createElement, createTextVNode } from './vdom/index'

export function renderMixin(Vue) {
  Vue.prototype._render = function () {
    const vm = this
    const { render } = vm.$options
    // 生成vnode -- 虚拟dom
    const vnode = render.call(vm)
    return vnode
  }
  
  Vue.prototype._c = function(...args) {
    // 创建虚拟dom元素
    return createElement(...args)
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