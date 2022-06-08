import { mergeOptions } from '../util/options'

export function initMixin(Vue) {
  Vue.mixin = function(mixin) {
    // 合并对象，全局混入
    this.options = mergeOptions(this.options, mixin)
    // return this
  }
}