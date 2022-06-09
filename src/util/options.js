import { hasOwn } from '../shared/util'
import { LIFECYCLE_HOOKS, ASSETS_TYPE } from '../shared/constants'

// 合并策略
const strats = {}

//生命周期合并策略
function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      // 合并成一个数组
      return parentVal.concat(childVal)
    } else {
      // 包装成一个数组
      return [childVal]
    }
  } else {
    return parentVal
  }
}

// 为生命周期添加合并策略
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook
})

// 组件 指令 过滤器的合并策略
function mergeAssets(parentVal, childVal) {
  // 比如有同名的全局组件和自己定义的局部组件
  // 那么parentVal代表全局组件,自己定义的组件是childVal
  // 首先会查找自已局部组件有就用自己的, 没有就从原型继承全局组件 res.__proto__===parentVal
  const res = Object.create(parentVal)
  if (childVal) {
    for (let k in childVal) {
      res[k] = childVal[k]
    }
  }
  return res
}

ASSETS_TYPE.forEach((type) => {
  strats[type + 's'] = mergeAssets
})

// mixin 核心方法
export function mergeOptions(parent, child) {
  const options = {}
  // 遍历父亲
  for (let k in parent) {
    mergeFiled(k)
  }
  // 父亲没有 儿子有
  for (let k in child) {
    if (!hasOwn(parent, k)) {
      mergeFiled(k)
    }
  }

  //真正合并字段方法 
  function mergeFiled(k) {
    if (strats[k]) {
      options[k] = strats[k](parent[k], child[k])
    } else {
      // 默认策略，先子再父
      options[k] = child[k] ? child[k] : parent[k]
    }
  }
  return options
}