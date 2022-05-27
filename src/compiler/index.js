import { parse } from './parse'
import { generate } from './codegen'

// template字符串转render函数
export function compileToFunctions(template, options) {
  // 1. 把html代码转成ast语法树
  const ast = parse(template.trim())
  // 2.优化静态节点
  // if (options.optimize !== false) {
  //   optimize(ast, options)
  // }
  // 3.通过ast 重新生成代码
  const code = generate(ast)
  // 使用with语法改变作用域为this  之后调用render函数可以使用call改变this 方便code里面的变量取值
  const renderFn = new Function(`with(this) {return ${code}}`)
  return renderFn
}