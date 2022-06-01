import { isDef } from "../shared/util"

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
  } else {
    if (oldVnode.tag !== vnode.tag) {
      // 虚拟dom的tag不同，需要替换
      const newElm = createElm(vnode)
      oldVnode.el.parentNode.replaceChild(newElm, oldVnode.el)
    }
    
    // 如果旧节点是个文本节点
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        oldVnode.el.textContent = vnode.text
      }
    }
    
    // 不符合上面两种 代表标签一致 并且不是文本节点
    // 为了节点复用 所以直接把旧的虚拟dom对应的真实dom赋值给新的虚拟dom的el属性
    const el = (vnode.el = oldVnode.el)
    // 更新属性
    updateProperties(vnode, oldVnode.data)
    const oldCh = oldVnode.children
    const newCh = vnode.children
    if (oldCh.length > 0 && newCh.length > 0) {
      // 新老都存在子节点，需要diff
      updateChildren(el, oldCh, newCh)
    } else if (oldCh.length) {
      // 老的有儿子，新的没有
      el.innerHTML = ''
    } else if (newCh.length) {
      // 新的有儿子，老的没有
      for (let i = 0; i < newCh.length; i += 1) {
        const child = newCh[i]
        el.appendChild(createElm(child))
      }
    }
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
function updateProperties(vnode, oldProps = {}) {
  const el = vnode.el // 真实节点
  const newProps = vnode.data || {} // 新的节点属性
  // 如果新的节点没有 需要把老的节点属性移除
  for (let key in oldProps) {
    if (!newProps[key]) {
      if (key === 'class') {
        el.className = ''
      } else {
        el.removeAttribute(key)
      }
    }
  }
  // 对style样式做特殊处理 如果新的没有 需要把老的style值置为空
  const newStyle = newProps.style || {}
  const oldStyle = oldProps.style || {}
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }
  // 遍历新的属性 进行增加操作
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

function isSameVnode(oldVnode, vnode) {
  return oldVnode.tag === vnode.tag && oldVnode.key === vnode.key
}

// diff算法核心 采用双指针的方式 对比新老vnode的儿子节点
function updateChildren(parent, oldCh, newCh) {
  let oldStartIndex = 0
  let oldStartVnode = oldCh[0]
  let oldEndIndex = oldCh.length - 1
  let oldEndVnode = oldCh[oldEndIndex]
  
  let newStartIndex = 0
  let newStartVnode = newCh[0]
  let newEndIndex = newCh.length - 1
  let newEndVnode = newCh[newEndIndex]
  
  // 生成老儿子的index映射表
  const map = makeIndexByKey(oldCh)
  
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 因为暴力对比过程把移动的vnode置为 undefined 如果不存在vnode节点 直接跳过
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIndex]
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 头和头对比 依次向后追加
      patch(oldStartVnode, newStartVnode) //递归比较儿子以及他们的子节点
      oldStartVnode = oldCh[++oldStartIndex]
      newStartVnode = newCh[++newStartIndex]
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      //尾和尾对比 依次向前追加
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIndex]
      newEndVnode = newCh[--newEndIndex]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 老的头和新的尾相同 把老的头部移动到尾部
      patch(oldStartVnode, newEndVnode)
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldCh[++oldStartIndex]
      newEndVnode = newCh[--newEndIndex]
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 老的尾和新的头相同 把老的尾部移动到头部
      patch(oldEndVnode, newStartVnode)
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldCh[--oldEndIndex]
      newStartVnode = newCh[++newStartIndex]
    } else {
      // 上述四种情况都不满足 那么需要暴力对比
      // 从新的开始子节点进行查找，如果新的开始子节点存在key，则根据老的子节点的key和index的映射表进行查找
      //  否则，从老的子节点数组中找出index（相同节点判断）
      // 如果可以找到就进行移动操作 如果找不到则直接进行插入
      const moveIndex = newStartVnode.key
        ? map[newStartVnode.key]
        : findIndexInOld(newStartVnode, oldCh, oldStartIndex, oldEndIndex)
      if (!moveIndex) {
        // 老的节点找不到, 说明是新节点，直接插入
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        let moveVnode = oldCh[moveIndex] // 找得到就拿到老的节点
        oldCh[moveIndex] = undefined // 这个是占位操作 避免数组塌陷  防止老节点移动走了之后破坏了初始的映射表位置
        patch(moveVnode, newStartVnode)
        parent.insertBefore(moveVnode.el, oldStartVnode.el) //把找到的节点移动到最前面
      }
      newStartVnode = newCh[++newStartIndex]
    }
  }
  
  // 如果老节点循环完毕了 但是新节点还有  证明  新节点需要被添加到头部或者尾部
  if (newStartIndex <= newEndIndex) {
      // 这是一个优化写法 insertBefore的第一个参数是null等同于appendChild作用
    const ele = newCh[newEndIndex + 1] == null ? null : newCh[newEndIndex + 1].el
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      parent.insertBefore(createElm(newCh[i]), ele)
    }
  }
  // 如果新节点循环完毕 老节点还有  证明老的节点需要直接被删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      const child = oldCh[i]
      if (child !== undefined) {
        parent.removeChild(child.el)
      }
    }
  }
}

// 根据key生成子节点的index映射表
function makeIndexByKey(children) {
  const map = {}
  children.forEach((child, index) => {
    const key = child.key
    if (isDef(key)) {
      map[key] = index
    }
  })
  return map
}

function findIndexInOld(vnode, oldCh, start, end) {
  for (let i = start; i <= end; i++) {
    const child = oldCh[i]
    if (isDef(child) && isSameVnode(vnode, child)) {
      return i
    }
  }
}
