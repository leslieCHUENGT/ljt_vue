# 相关文章总结
[源码文章专栏](https://juejin.cn/column/7258222037318320186)
- `render`、`diff`、`vuex`、`vue-router`、`keepalive`、`slot`、`nextTick`
- ` axios `
# my_vue
基于 vue3 源码实现一个 TDD mini 版的 vue
### reactivity
- [x] reactive 的实现
- [x] track 依赖收集
- [x] trigger 触发依赖
- [x] 支持 effect.scheduler
- [x] 支持 effect.stop
- [x] readonly 的实现
- [x] 支持 isReactive
- [x] 支持 isReadonly
- [x] 支持嵌套 reactive
- [x] 支持嵌套 readonly
- [x] 支持 shallowReadonly
- [x] 支持 isProxy
- [x] ref 的实现
- [x] 支持 isRef
- [x] 支持 unref
- [x] 支持 proxyRefs
- [x] computed 的实现
- [x] watch 的实现

### runtime-core 部分
- [x] 实现初始化 component 主流程
- [x] 实现初始化 element 主流程 （通过递归 patch 拆箱操作，最终都会走向 mountElement 这一步）
- [x] 实现组件代理对象 （instance.proxy 解决`render()`函数的 this 指向问题）
- [x] 实现 shapeFlags （利用位运算 左移运算 对 vnode 添加标识，标识是什么类型：子级文本，子级数组，组件，HTML 元素）
- [x] 实现注册事件功能 （通过在 vnode.props 识别 props 对象的 key 是以 on 开头并且后一个字母是大写来判断是否是事件）
- [x] 实现组件 props 功能 （在 render 的 h 函数中可以用 this 访问到，并且是 shallowReadonly）
- [x] 实现组件 emit 功能 （获取组件的 props 并判断 props 的'on+事件名'是否是 emit 的第一个参数：事件名匹配，是的话就执行 props 的里面的事件）
- [x] 实现组件 slots 功能 (具名插槽&作用域插槽)
- [x] 实现 Fragment 和 Text 类型节点 (避免固定死外层嵌套某个元素 比如说 div，使用 Fragment/Text 标识符 直接不渲染外层的 div，直接走 mountChildren 函数 处理 children 外层用户需要什么节点进行包裹自行选择)
- [x] 实现 getCurrentInstance
- [x] 实现 provide-inject 功能


# 参考

基于 mini-vue 的实现，再阅读 vue3 源码 总结
