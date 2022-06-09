import { ASSETS_TYPE } from '../shared/constants'
import { isPlainObject } from '../shared/util'

export function initAssetRegisters(Vue) {
  ASSETS_TYPE.forEach((type) => {
    Vue[type] = function(id, difinition) {
      if (!difinition) {
        // 只传id，返回id对应内容
        return this.options[type + 's'][id]
      } else {
        if (type === 'component' && isPlainObject(difinition)) {
          // 允许传入一个扩展过的构造器，或者一个选项对象 (自动调用 Vue.extend)
          difinition.name = difinition.name || id
          difinition = this.options._base.extend(difinition)
        }
        if (type === 'directive' && typeof difinition === 'function') {
          // 允许传入一个函数，或者一个对象
          difinition = { bind: difinition, update: difinition }
        }
        this.options[type + 's'][id] = difinition
      }
    }
  })
}