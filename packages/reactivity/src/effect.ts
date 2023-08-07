import { extend, isArray } from "@min-vue/shared"
import { TriggerOpTyes } from "./operations"


// 定义常量
export const ITERATE_KEY = Symbol()

// 定义全局变量
let activeEffect // 当前活动的副作用函数
let shouldTrack // 是否需要跟踪副作用

// 暂停跟踪副作用，暴露给数组的方法中使用
export function pauseTracking() {
  shouldTrack = false
}

// 重置跟踪状态
export function resetTracking() {
  shouldTrack = true
}

// 创建副作用函数
export function effect(fn, options: any = {}) {

  // 创建 ReactiveEffect 对象
  const _effect = new ReactiveEffect(fn, options.scheduler)

  // 将 options 属性扩展到 _effect 对象上
  extend(_effect, options)

  // 若不是延迟执行，则立即运行副作用函数
  if (!options || !options.lazy) {
    _effect.run()
  }

  // 创建并返回一个 runner 函数
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

// 定义 ReactiveEffect 类
export class ReactiveEffect {
  private _fn: any
  deps = [] // 依赖项集合
  active = true // 是否处于激活状态，暴露出effect.stop()进行停止effect执行
  onStop?: () => void

  constructor(fn, public scheduler?) {
    this._fn = fn
  }

  // 运行副作用函数
  run() {
    if (!this.active) {
      return this._fn()
    }
    shouldTrack = true
    activeEffect = this

    const result = this._fn()

    shouldTrack = false

    return result
  }

  // 停止当前副作用函数
  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.onStop && this.onStop()
      this.active = false
    }
  }
}

// 清理副作用的依赖项集合
function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

// target: 被跟踪对象，key: 属性键
const targetMap = new Map() // 存储 target、key 和 dep 的映射关系

// 跟踪副作用函数和它所依赖的属性
export function track(target, key) {
  if (!activeEffect) return
  if (!shouldTrack) return

  if (!isTracking()) return

  // 获取或创建 depsMap
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 获取或创建 dep
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  // 跟踪 effects 和 dep 之间的关系
  trackEffects(dep)
}

// 是否正在跟踪副作用
export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

// 跟踪副作用和依赖项之间的关系
export function trackEffects(dep) {
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

// 触发副作用函数
// 触发副作用函数
export function trigger(target, type, key) {
  // 从 targetMap 中获取依赖项映射关系 depsMap
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  let deps: any = []

  // 根据不同的触发类型，获取相应的 dep
  if (key !== void 0) {
    // 如果存在键值 key，则从 depsMap 中获取对应的 dep，并加入到 deps 数组中
    deps.push(depsMap.get(key))
  }


  // 获取所有 effects
  const effects: any = []
  for (const dep of deps) {
    if (dep) {
      // 将 dep 中的所有副作用函数添加到 effects 数组中
      effects.push(...dep)
    }
  }

  // 触发 effects
  triggerEffects(effects)
}

// 触发副作用函数
export function triggerEffects(dep) {
  // 遍历 dep 数组中的每个副作用函数 effect
  for (const effect of dep) {
    if (effect.scheduler) {
      // 如果 effect 中定义了 scheduler，则调用 scheduler 函数
      effect.scheduler()
    } else {
      // 否则直接调用 effect 的 run 方法运行副作用函数
      effect.run()
    }
  }
}


// 停止运行 runner 函数
export function stop(runner) {
  runner.effect.stop()
}
