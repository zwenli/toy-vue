export function patch(oldVnode, vnode) {
  // 判断传入的oldVnode是否是一个真实dom节点
  // 关键 初次渲染时，传入的vm.$el 就是传入的el选项，所以是真实dom
  // 如果不是初始渲染而是视图更新的时候  vm.$el就被替换成了更新之前的老的虚拟dom
  const isRealElement = oldVnode.nodeType
  if (isRealElement) {
    // 这里是初次渲染的逻辑
    const oleElm = oldVnode
    const parentElm = oleElm.parentNode
    // 将虚拟dom转化成真实dom节点
    const el = createElm(vnode)
    // 插入到 老的el节点下一个节点的前面 就相当于插入到老的el节点的后面
    // 这里不直接使用父元素appendChild是为了不破坏替换的位置
    parentElm.insertBefore(el, oleElm.nextSibling)
    // 删除老的el节点
    parentElm.removeChild(oleElm)
    return el
  }
}

// 虚拟dom转成真实dom 就是调用原生方法生成dom树
function createElm(vnode) {
  const { tag, children, text } = vnode
  //   判断虚拟dom 是元素节点还是文本节点
  if (typeof tag === 'string') {
    //  虚拟dom的el属性指向真实dom
    vnode.el = document.createElement(tag)
    // 解析虚拟dom属性
    updateProperties(vnode)
    // 如果有子节点，递归插入到父节点
    if (children) {
      children.forEach(child => {
        vnode.el.appendChild(createElm(child))
      })
    }
  } else {
    // 文本节点
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

// 解析vnode的data属性 映射到真实dom上
function updateProperties(vnode) {
  const el = vnode.el
  const newProps = vnode.data || {}
  for (let key in newProps) {
    if (key === 'style') {
      // style 需要特殊处理下
      for (let styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if (key === 'class') {
      // class 需要特殊处理
      el.className = newProps[key]
    } else {
      // 给这个元素添加属性 值就是对应的值
      el.setAttribute(key, newProps[key])
    }
  }
}
