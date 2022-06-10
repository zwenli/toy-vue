## 混入原理

混入原理
混入的选后顺序
不同选项的合并策略

## 组件原理

每个组件都是继承自Vue的子类，能够使用Vue原型上的方法。

### 全局组件注册

initGlobalApi方法主要用来注册Vue的全局方法

全局组件就是使用 Vue.extend 方法把传入的选项处理之后挂载到了 Vue.options.components 上面
局部组件同理，之后挂载到父组件（即Vue的子类）的 options.compoents 上

### Vue.extend
核心思路是使用了原型继承的方法返回了Vue的子类，并且利用 mergeOptions 把传入组件的 options 和父类的 options 进行了合并

### 组件合并策略
使用到了原型继承的方式来进行组件合并，组件内部优先查找自己局部定义的组件，找不到会向上查找原型中定义的组件

### 创建Vnode
需要改写 createElement 方法，对于非普通 html 标签，就需要生成组件 Vnode 把 Ctor 和 children 作为 Vnode 最后一个参数 componentOptions 传入

### 渲染组件真实dom
如果判断Vnode 是属于组件，那么把渲染好的组件真实dom（vnode.componentInstance.$el）挂载到 vnode.el上
并返回

## 计算属性原理

计算属性的主要特征是，如果计算属性依赖的值不发生变化，页面更新时不会重新计算，计算结果会被缓存起来。

### 计算属性初始化
### 对计算属性进行属性劫持
### Watcher的改造，lazy，dirty 
### 外层 （渲染）watcher的依赖收集
