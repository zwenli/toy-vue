// 正则
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})` //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束  >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性  形如 id="app"

const ELEMENT_TYPE = 1
const TEXT_TYPE = 3

// 解析html生成ast核心
export function parse(html) {
  const stack = []
  let root, currentParent
  while (html) {
    // 查找<
    let textEnd = html.indexOf('<')
    // 如果<在第一个 那么证明接下来就是一个标签 不管是开始还是结束标签
    if (textEnd === 0) {
      // 如果开始标签解析有结果
      const startTagMatch = parseStartTag()
      if (startTagMatch) {
        // 把解析好的标签名和属性解析生成ast
        handleStartTag(startTagMatch)
        continue
      }
      // 匹配结束标签</
      const endTagMatch = parseEndTag()
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        handleEndTag(endTagMatch[1])
        continue
      }
    }
    // text
    let text
    if (textEnd >= 0) {
      // 形如 hello<span></span>
      text = html.substring(0, textEnd)
    }
    if (textEnd < 0) {
      // 形如 hello
      text = html
    }
    if (text) {
      advance(text.length)
      handleChars(text)
    }
  }
  
  return root
  
  // 匹配开始标签
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      // 匹配成功时，截取掉匹配的startTag
      advance(start[0].length)
      
      // 开始匹配属性
      // end代表结束符号 >
      // attr 代表匹配的属性
      let end, attr
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        // 属性
        if (attr) {
          advance(attr[0].length)
          attr = {
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] // 双引号，单引号，无引号
          }
          match.attrs.push(attr)
        }
      }
      // 结束符>匹配成功，代表开始标签解析完毕
      if (end) {
        advance(1)
        return match
      }
    }
  }
  // 对开始标签进行处理
  function handleStartTag({ tagName, attrs }) {
    let element = createASTElement(tagName, attrs)
    if (!root) {
      root = element
    }
    currentParent = element
    stack.push(element)
  }
  // 匹配结束标签
  function parseEndTag() {
    return html.match(endTag)
  }
  // 对结束标签进行处理
  function handleEndTag(tagName) {
    // stack中，栈顶是当前匹配的元素
    const element = stack.pop()
    // if (tagName !== element.tag) {
    //   warn('match error')
    // }
    // 当前父元素就是栈顶的上一个元素
    currentParent = stack[stack.length - 1]
    // 建立 parent 与 children 的关系
    if (currentParent) {
      element.parent = currentParent
      currentParent.children.push(element)
    }
  }
  
  // 处理文本
  function handleChars(text) {
    // 去除空格，实际源码这里是配置的
    // text = text.replace(/\s/g, '')
    currentParent.children.push({
      type: TEXT_TYPE,
      text
    })
  }
  // 截取html字符串 每次匹配到了就往前继续匹配
  function advance(n) {
    html = html.substring(n)
  }
  
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: ELEMENT_TYPE,
      attrs,
      parent: null,
      children: [],
    }
  }
}