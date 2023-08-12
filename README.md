# 🕳️ 声明
项目是通过阅读[vue3](https://github.com/vuejs/core/tree/main)源码，函数名、代码组织方式都与vue3官方保持一致，抽离一切非vue的核心逻辑。**如果大家在阅读过程中发现任何问题，欢迎在issue中提出，同时也欢迎大家提交PR。当然如果在阅读过程中有什么疑惑，也欢迎在issue中提出。**

# 🙌 使用方式

项目采取monorepo结构
当然也可以选择自己打包
~~~shell
  pnpm run build
  or
  nr build 
~~~
# 🗯️ 插件
1. 这里推荐大家使用[ni](https://github.com/antfu/ni)

2. 在运行index.html文件的时候同样推荐大家安装vscode插件[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

# ✏ 往期源码文章
[源码文章专栏](https://juejin.cn/column/7258222037318320186)
- `render`、`diff`、`vuex`、`vue-router`、`keepalive`、`slot`、`nextTick`
- ` axios `
# 🛠 功能清单

### reactivity 部分
#### 响应式系统的实现
- [x] 实现 computed 计算属性功能
#### effect
- [x] 实现 effect 依赖收集和依赖触发
- [x] 实现 effect 返回 runner
- [x] 实现 effect 的 scheduler 功能(调度执行)
- [x] 实现 effect 的 stop 功能
- [x] 优化 stop 功能
- [x] 实现嵌套 effect 函数（实现中）

#### reactive
- [x] 实现 reactive 依赖收集和依赖触发
- [x] 实现 readonly 功能
- [x] 实现 isReactive 和 isReadonly 功能
- [x] 实现 readonly 和 reactive 嵌套对象功能
- [x] 实现 shallowReadonly 功能
- [x] 实现 shallowReactive 功能
- [x] 实现 isProxy 功能
- [x] 实现 isShallow 功能

#### 代理对象
- [x] 实现拦截 in 操作符(xx in obj  是不会触发 get 和 set 操作的 他会触发 has 操作 所以需要针对in操作符在 proxy 完善 has 拦截器)
- [x] 实现拦截 delete 操作符(delete obj.xxx  是不会触发 get 和 set 操作的 他会触发 deleteProperty 操作 所以需要针对 delete 操作符在 proxy 完善 deleteProperty 拦截器)
- [x] 实现拦截 for in 语句(for(let key in obj){your code...}  是不会触发get和set操作的 他会触发 ownKeys 操作 所以需要针对 in 操作符在 proxy 完善 ownKeys 拦截器)

#### 代理数组
- [x] 重写 array 的 includes & indexOf & lastIndexOf 方法
- [x] 重写 array 的 push & pop & shift & unshift & splice 方法 (这几个方法会影响数组的length属性 如果不屏蔽对length属性的依赖会造成死循环)






