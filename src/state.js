import { observe } from './obserber/index'
import { noop } from './shared/util'

// 数据代理
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}
function proxy(object, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(object, key, sharedPropertyDefinition)
}

// 初始化状态
// 初始化顺序为 props > methods > data > computed > watch
export function initState(vm) {
  const opts = vm.$options
  if (opts.props) {
    initProps(vm)
  }
  if (opts.methods) {
    initMethods(vm)
  }
  if (opts.data) {
    // data 初始化
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }
}

function initProps(vm) {}

function initMethods(vm) {}

// 初始化data 数据
function initData(vm) {
  let data = vm.$options.data
  // 传入的data，保存在实例的_data属性上
  // vue实例的data为函数，防止数据在组件之间共享
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}
  
  // 把 data 代理到 vm 上即 Vue 实例上面，这样就可以通过 this.a 访问到 this._data.a
  for (let key in data) {
    proxy(vm, '_data', key)
  }
  // 对数据进行观测，响应式数据核心
  observe(data)
}

function initComputed(vm) {}

function initWatch(vm) {}
