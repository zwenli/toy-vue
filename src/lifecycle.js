import { patch } from './vdom/patch'
import { Watcher } from './obserber/watcher'
import { noop } from './shared/util'

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this
    // patch是渲染vnode为真实dom核心
    vm.$el = patch(vm.$el, vnode)
  }
}
export function mountComponent(vm, el) {
  // 模板编译解析生成了render函数之后
  // 下一步是调用 vm._render()方法，调用生成的reder函数 生成虚拟dom
  // 最后使用 vm._update()方法把虚拟dom渲染到页面
  
  // 真实的el选项赋值给实例的$el属性 为之后虚拟dom产生的新的dom替换老的dom做铺垫
  vm.$el = el
  const updateComponent = () => {
    vm._update(vm._render())
  }
  // 渲染wathcer
  new Watcher(vm, updateComponent, noop, {}, true)
}