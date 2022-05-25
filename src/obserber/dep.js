let uid = 0

export class Dep {
  constructor() {
    this.id = ++uid
    this.subs = []
  }
  // 收集依赖，观察者使用
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
  // 收集观察者
  addSub(watcher) {
    this.subs.push(watcher)
  }
  // 派发更新，通知所有的观察者更新视图
  notify() {
    for (let i = 0; i < this.subs.length; i += 1) {
      this.subs[i].update()
    }
  }
}

Dep.target = null
const targetStack = []

export function pushTarget(target) {
  targetStack.push(target)
  Dep.target = target
}
export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}