import { initMixin } from './mixin'

export function initGlobalAPI(Vue) {
  
  Vue.options = {}
  Vue.options._base = Vue

  initMixin(Vue)
}