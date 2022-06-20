import { toArray } from '../shared/util'

export function initUse(Vue) {
  Vue.use = function(plugin) {
    // 当 install 方法被同一个插件多次调用，插件将只会被安装一次。
    const installPlugins = this._installedPlugins || (this._installedPlugins = [])
    if (installPlugins.indexOf(plugin) > -1) {
      // 安装过这个插件，则直接返回
      return this
    }

    // 附加参数的处理
    const args = toArray(arguments, 1)
    args.unshift(this)

    // type plugin.install = function(Vue, options) {}
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }

    // 记录安装过的插件
    installPlugins.push(plugin)
    return this
  }
}