const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g //匹配花括号 {{  }} 捕获花括号里面的内容

// 渲染辅助函数
// src/core/instance/render-helpers
// _c createElement
// _v text to VNode 创建文本节点
// _s toString 对象变量转文本

function gen(node) {
  // 判断节点类型
  // 主要包含处理文本核心
  // 源码这块包含了复杂的处理  比如 v-once v-for v-if 自定义指令 slot等等 这里只考虑普通文本和变量表达式{{}}的处理
  if (node.type === 1) {
    // 递归创建节点
    return generate(node)
  } else {
    // 处理文本节点
    let text = node.text
    // 不存在花括号变量表达式
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }
    // 正则是全局模式 每次需要重置正则的lastIndex属性  不然会引发匹配bug
    let lastIndex = (defaultTagRE.lastIndex = 0)
    let tokens = []
    let index, match
    
    while((match = defaultTagRE.exec(text))) {
      // index 表示匹配到的位置
      index = match.index
      // 处理普通文本，即 {{ 前面的内容 
      if (index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      }
      // 处理变量表达式
      tokens.push(`_s(${match[1].trim()})`)
      // 匹配后指针后移
      lastIndex = index + match[0].length
    }
    
    // 处理剩余的文本内容
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    // 最终返回文本节点，tokens里的内容最后都是字符串，拼接
    return `_v(${tokens.join('+')})`
  }
}
function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i]
    // 对attrs 属性里的style特殊处理
    if (attr.name === 'style') {
      const obj = {}
      attr.value.replace(/\s/g, '').split(';').forEach(s => {
        const [key, value] = s.split(':')
        key && (obj[key] = value)
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  
  return `{${str.slice(0, -1)}}`
}

function getChildren(el) {
  const children = el.children
  if (children) {
    // [] or , , 
    return `[${children.map(c => gen(c)).join(',')}]`
  }
}

export function generate(el) {
  const children = getChildren(el)
  const code = `_c('${el.tag}',${genData(el)}${
    children ? `,${children}` : ''
  })`
  return code
}

export function genData(el) {
  let data = '{'
  // 只处理了属性
  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)},`
  }
  data = data.replace(/,$/, '') + '}'
  return data
}
