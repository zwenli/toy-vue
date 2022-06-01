import { isPrimitive } from "../shared/util"

export default class Vnode {
  constructor(tag, data, children, text, el) {
    this.tag = tag
    this.data = data
    this.key = data && data.key
    this.children = children || []
    this.text = text
    this.el = el
  }
}
export function createElement(tag, data, children) {
  // data为数组或原始类型，认为是子节点
  if (Array.isArray(data) || isPrimitive(data)) {
    children = data
    data = undefined
  }
  // children 可以是文本节点
  if (isPrimitive(children)) {
    children = [createTextVNode(children)]
  }

  return new Vnode(tag, data, children)
}
export function createTextVNode(text) {
  return new Vnode(undefined, undefined, undefined, text)
}