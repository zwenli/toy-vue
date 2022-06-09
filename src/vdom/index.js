import { isPlainObject, isPrimitive } from '../shared/util'
import { isReservedTag } from '../util/element'

export default class Vnode {
  constructor(tag, data, children, text, el, context, componentOptions) {
    this.tag = tag
    this.data = data
    this.key = data && data.key
    this.children = children || [] // 子节点
    this.text = text // 文本内容
    this.el = el // 元素节点
    this.context = context // 对应的组件上下文
    this.componentOptions = componentOptions // 组件选项
    this.componentInstance = null // 组件实例
  }
}
export function createElement(context, tag, data, children) {
  // data为数组或原始类型，认为是子节点
  if (Array.isArray(data) || isPrimitive(data)) {
    children = data
    data = undefined
  }
  // children 可以是文本节点
  if (isPrimitive(children)) {
    children = [createTextVNode(children)]
  }
  let vnode
  if (typeof tag === 'string') {
    let Ctor
    if (isReservedTag(tag)) {
      // 普通标签
      vnode = new Vnode(tag, data, children, undefined, undefined, context)
    } else if ((Ctor = context.$options.components[tag])) {
      // 组件
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // 其他情况
      vnode = new Vnode(tag, data, children, undefined, undefined, context)
    }
  } else {
    // 已经是组件 options或 constructor
    vnode = createComponent(tag, data, context, children)
  }
  return vnode
}

export function createTextVNode(text) {
  return new Vnode(undefined, undefined, undefined, text)
}

// 创建组件
export function createComponent(Ctor, data, context, children, tag) {
  const baseCtor = context.$options._base
  if (isPlainObject(Ctor)) {
    // 如果没有被改造成构造函数
    Ctor = baseCtor.extend(Ctor)
  }
  data = data || {}
  const hooks = data.hook || (data.hook = {})
  // 声明组件自己内部的生命周期
  // TODO: 这里应该是有合并hook的逻辑，这里简化为判断是否有hook，详情可看源码“installComponentHooks”
  if (!hooks.init) {
    hooks.init = function(vnode) {
      const child = (vnode.componentInstance = new Ctor({ _isComponent: true })) //实例化组件
      child.$mount() //因为没有传入el属性,需要手动挂载, 为了在组件实例上面增加$el方法可用于生成组件的真实渲染节点
    }
  }

  const name = Ctor.options.name || tag
  const cid = Ctor.cid
  // 组件vnode  也叫占位符vnode  ==> $vnode
  return new Vnode(`vue-component-${cid}${name ? `-${name}`: ''}`,
  data, undefined, undefined, undefined, context, { Ctor, tag, children })
}