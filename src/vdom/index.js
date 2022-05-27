export default class Vnode {
  constructor(tag, data, key, children, text) {
    this.tag = tag
    this.data = data
    this.key = key
    this.children = children
    this.text = text
  }
}
export function createElement(tag, data = {}, ...children) {
  const key = data.key
  return new Vnode(tag, data, key, children)
}
export function createTextVNode(text) {
  return new Vnode(undefined, undefined, undefined, undefined, text)
}