import { pushTarget, popTarget } from './dep'
import { queueWatcher } from './scheduler'
import { parsePath } from '../util/lang'
let uid = 0

export class Watcher {
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // this.options = options
    if (options) {
      this.deep = !!options.deep
      this.lazy = !!options.lazy // 标识计算属性watcher
      this.user = !!options.user // 标识用户watcher
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.lazy = this.user = this.sync = false
    }
    
    this.id = ++uid
    this.cb = cb // 回调函数
    this.deps = []
    this.depIds = new Set()
    this.dirty = this.lazy // dirty可变,表示计算watcher是否需要重新计算,默认值是true
    // getter 的表达式解析
    if (typeof expOrFn === 'function') {
      // 传入的表达式是函数
      this.getter = expOrFn
    } else {
      // 也可以是字符串，形如'a.b.c'
      this.getter = parsePath(expOrFn)
    }
    // 实例化就会默认调用get方法，get即为取值操作，进行依赖收集的过程
    // 实际会根据lazy判断是否立即执行 get(), 计算属性实例化的时候不会去调用get方法
    this.value = this.lazy ? undefined : this.get()
  }

  get() {
    // 调用getter之前，设置全局Dep.target为当前wathcer
    let value
    pushTarget(this)
    const vm = this.vm
    try {
      // 如果watcher是渲染watcher 那么就相当于执行 vm._update(vm._render())
      // 这个方法在render函数执行的时候会取值 从而实现依赖收集
      value = this.getter.call(vm, vm)
    } finally {
      // TODO: deep 的处理
      // 在调用方法之后把当前watcher实例从全局Dep.target移除
      popTarget()
    }
    return value
  }
  //  把dep放到deps里面 同时保证同一个dep只被保存到watcher一次
  //  同样的  同一个watcher也只会保存在dep一次
  addDep(dep) {
    const id = dep.id
    if (!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)
      //  直接调用dep的addSub方法,把自己--watcher实例添加到dep的subs容器里面
      dep.addSub(this)
    }
  }
  
  update() {
    // this.run()
    if (this.lazy) {
      // 计算属性依赖的值发生变化，只需要把dirty置为true，下次访问到了重新计算
      this.dirty = true
    } else {
      // 每次watcher进行更新的时候，可以让他们先缓存起来，之后再一起调用
      // 异步队列机制
      queueWatcher(this)
    }
  }
  // 计算属性重新进行计算，并且计算完成把dirty置为false
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
  // 对wacher的依赖进行收集
  depend() {
    // 计算属性的watcher存储了依赖项的dep
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend() //调用依赖项的dep去收集渲染watcher
    }
  }
  
  run() {
    const vm = this.vm
    const value = this.get()
    const oldValue = this.value
    this.value = value
    if (this.user) {
      // 用户watcher
      // TODO: 源码中有异常逻辑处理，这里忽略
      this.cb.apply(vm, [value, oldValue])
    } else {
      // 渲染watcher
      this.cb.call(vm, value, oldValue)
    }
  }
}
