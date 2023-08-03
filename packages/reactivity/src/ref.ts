import { hasChanged, isObject } from "@mick-vue/shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

// Ref模板类，用于创建Ref对象
class RefTmpl {
  private _rawValue: any // 原始值
  private _value: any // 响应式值
  private dep: any // 依赖集合
  private __v_isRef = true // 标记为Ref对象

  constructor(value) {
    this._rawValue = value
    // 如果value是对象，则使用reactive进行响应式处理
    this._value = convert(value)
    this.dep = new Set() // 初始化依赖集合
  }

  get value() {
    if (isTracking()) {
      trackRefValue(this) // 响应式收集依赖
    }
    return this._value
  }

  set value(newval) {
    // 判断新值是否改变
    if (hasChanged(this._rawValue, newval)) {
      this._rawValue = newval
      this._value = convert(newval) // 对新值进行响应式处理
      triggerRefValue(this) // 触发依赖更新
    }
  }
}

// 创建Ref对象
export function ref(value) {
  const refTmpl = new RefTmpl(value)
  return refTmpl
}

// 将值转换为响应式值
function convert(value) {
  return isObject(value) ? reactive(value) : value
}

// 响应式收集Ref的依赖
export function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

// 触发Ref的依赖更新
export function triggerRefValue(ref) {
  triggerEffects(ref.dep)
}

// 判断是否为Ref对象
export function isRef(ref) {
  return !!ref.__v_isRef
}

// 获取Ref的值，如果不是Ref对象，则直接返回原值
export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

// 创建Ref对象的代理，访问代理对象的属性时会自动解构Ref对象，并返回其value值
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return target[key].value = value
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
