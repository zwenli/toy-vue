import { initMixin } from './init'

function Vue(options) {
  // 这里开始Vue 的初始化工作
  this._init(options)
}

initMixin(Vue)

export default Vue
