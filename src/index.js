import { initMixin } from './init'
import { renderMixin } from './render'
import { lifecycleMixin } from './lifecycle'

function Vue(options) {
  // 这里开始Vue 的初始化工作
  this._init(options)
}

// 混入_init,$mount
initMixin(Vue)
// 混入_render，render辅助函数
renderMixin(Vue)
// 混入_update
lifecycleMixin(Vue)

export default Vue
