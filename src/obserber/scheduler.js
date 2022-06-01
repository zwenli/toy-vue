/**
 * 调度相关的操作
 */
import { nextTick } from '../util/next-tick'

const queue = []
let has = {}

function flushSchedulerQueue() {
  for (let i = 0; i < queue.length; i += 1) {
    // 调用 watcher 的 run方法，执行真正的更新操作
    const watcher = queue[i]
    watcher.run()
  }
  // 执行完成后清空队列
  queue.length = 0
  has = {}
}

// 实现异步队列机制
export function queueWatcher(watcher) {
  const id = watcher.id
  // watcher去重
  if (has[id] === undefined) {
    //  同步代码执行 把全部的watcher都放到队列里面去
    has[id] = true
    queue.push(watcher)
    // 进行异步调用
    nextTick(flushSchedulerQueue)
  }
}
