import { observe } from './obserber/index'
import { noop, isPlainObject, hasOwn, bind } from './shared/util'
import { Watcher } from './obserber/watcher'
import { Dep, popTarget, pushTarget } from './obserber/dep'

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
  vm._watchers = []
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

function initMethods(vm) {
  const methods = vm.$options.methods
  const props = vm.$options.props
  for (const key in methods) {
    if (props && hasOwn(props, key)) {
      console.warn(`methods中的${key}属性和props中的${key}属性冲突`)
    } else {
      vm[key] = typeof methods[key] === 'function' ? bind(methods[key], vm) : noop
    }
  }
}

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

function initComputed(vm) {
  const computed = vm.$options.computed
  
  const watchers = vm._computedWatchers = {} // 用来保存计算属性的watcher
  
  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 创建计算watcher，lazy设置为true
    watchers[key] = new Watcher(vm, getter, noop, { lazy: true })
    defineComputed(vm, key, userDef)
  }
}

// 重新定义计算属性，对get和set劫持
function defineComputed(vm, key, userDef) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = noop
  } else {
    // 用户传入的是对象，需要设置set
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = userDef.set || noop
  }
  // 利用Object.defineProperty来对计算属性的get和set进行劫持
  Object.defineProperty(vm, key, sharedPropertyDefinition)
}

// 重写计算属性的get方法 来判断是否需要进行重新计算
function createComputedGetter(key) {
  return function computedGetter() {
    const vm = this
    const watcher = vm._computedWatchers && vm._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        // 计算属性取值的时候，如果是脏的，需要重新求值
        // 但此时是没有触发到视图更新的，也就是数据改变了，视图没有更新
        watcher.evaluate()
      }
      // 因此需要手动收集依赖，把计算属性的依赖项也添加渲染 watcher 的依赖
      if (Dep.target) {
        // 如果Dep还存在target，这个时候一般为渲染watcher，计算属性依赖的数据也需要收集
        watcher.depend()
        // 让计算属性依赖的值收集一遍外层的渲染watcher，这样子当计算属性依赖的值改变了既可以重新计算又可以刷新视图
      }
      return watcher.value
    }
  }
}

function initWatch(vm) {
  const watch = vm.$options.watch
  for (const k in watch) {
    const handler = watch[k] // 用户自定义的watch，可以是函数，对象，数组，字符串
    if (Array.isArray(handler)) {
      // 对于数组，需要遍历创建watch
      handler.forEach((handle) => {
        createWatch(vm, k, handle)
      })
    } else {
      createWatch(vm, k, handler)
    }
  }
}

// 处理watch的兼容性写法，包含函数，对象，数组，字符串，最后调用vm.$watch传入处理好的参数创建用户watcher
function createWatch(vm, expOrFn, handler, options) {
  if (isPlainObject(handler)) {
    // 对于对象
    options = handler // 保存用户传入的对象
    handler = handler.handler // 对象的handler代表用户真正传入的函数
  }
  if (typeof handler === 'string') {
    // 对于字符串，代表是定义好的methods中的方法
    handler = vm[handler]
  }
  // 调用 vm.$watch 创建用户watch
  vm.$watch(expOrFn, handler, options)
}

export function stateMixin(Vue) {
  /**
   * 
   * @param {string} expOrFn 
   * @param {object | Function} cb 
   * @param {?object} options 
   * @returns {Function} unwatch Fn
   */
  Vue.prototype.$watch = function(expOrFn, cb, options) {
    const vm = this
    if (isPlainObject(cb)) {
      return createWatch(vm, expOrFn, cb, options)
    }
    options = options || {}
    // user 表示是用户创建的watch
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    // immediate，立即执行回调
    if (options.immediate) {
      pushTarget()
      cb.apply(vm, [watcher.value])
      popTarget()
    }
    
    // TODO: teardown功能待实现
    // return function unwatch() {
    //   watcher.teardown()
    // }
  }
}
