import { initMixin } from './mixin'
import { ASSETS_TYPE } from '../shared/constants'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'

export function initGlobalAPI(Vue) {
  
  Vue.options = {}
  ASSETS_TYPE.forEach((type) => {
    Vue.options[type + 's'] = {}
  })
  Vue.options._base = Vue //_base指向Vue

  initMixin(Vue) // Vue.mixin
  initExtend(Vue) // Vue.extend
  initAssetRegisters(Vue) // component, directive, filter
}