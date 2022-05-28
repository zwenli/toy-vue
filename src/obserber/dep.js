let uid = 0
// dep 和 watcher 是多对对的关系
// 每个（响应式）属性都有自己的dep
export class Dep {
  constructor() {
    this.id = uid++
    this.subs = [] // 存放watcher的容器
  }
  // 收集依赖，观察者使用
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this) // 把自身-dep实例存放在watcher里面
    }
  }
  // 收集观察者
  addSub(watcher) {
    // 把watcher加入到自身的subs容器
    this.subs.push(watcher)
  }
  // 派发更新，依次执行watcher的更新方法。
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