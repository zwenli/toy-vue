import { initState } from './state'
import { Watcher } from './obserber/watcher'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    // options 为 new Vue 传入的属性
    vm.$options = options
    // 初始化状态
    initState(vm)
    // render test
    new Watcher(vm, options.render)
  }
}
