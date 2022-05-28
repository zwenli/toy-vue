import { pushTarget, popTarget } from './dep'
let uid = 0

export class Watcher {
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm
    // if (!isRenderWatcher) {
    //   vm.__watcher = this
    // }
    // vm._watchers.push(this)
    this.id = ++uid
    this.cb = cb // 回调函数
    this.deps = []
    this.depIds = new Set()
    this.options = options
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    }
    // 实例化就会默认调用get方法
    // 实际会根据lazy判断是否立即执行 get()
    this.value = this.get()
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
    this.run()
  }
  
  run() {
    const vm = this.vm
    const value = this.get()
    const oldValue = this.value
    this.value = value
    if (typeof this.cb === 'function') {
      this.cb.call(vm, value, oldValue)
    }
  }
}
