import { pushTarget, popTarget } from './dep'
let uid = 0

export class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm
    this.id = ++uid
    this.cb = cb
    this.deps = []
    this.depIds = new Set()
    this.options = options
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    }
    
    this.get()
  }

  get() {
    // 调用getter时，设置target为当前wathcer
    let value
    pushTarget(this)
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } finally {
      popTarget()
    }
    return value
  }
  
  addDep(dep) {
    const id = dep.id
    if (!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)
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
