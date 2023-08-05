import { isObject } from "@min-vue/shared"
import { mutableHandler, readonlyHandler, shallowReadonlyHandlers } from "./baseHandlers"

// 响应式标志枚举
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive', // 标记对象是响应式的
  IS_READONLY = '__v_isReadonly', // 标记对象是只读的
  RAW = '__v_raw' // 存储原始对象
}

// WeakMap用于存储代理对象和原始对象的对应关系
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
const shallowReadonlyMap = new WeakMap()

// 根据原始对象创建响应式对象
export function reactive(raw) {
  return createReactiveObject(raw, mutableHandler, reactiveMap)
}

// 根据原始对象创建只读响应式对象
export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandler, readonlyMap)
}

// 根据原始对象创建浅只读响应式对象
export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers, shallowReadonlyMap)
}

// 判断对象是否是响应式的
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE]
}

// 判断对象是否是只读的
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

// 判断对象是否是代理对象（响应式或只读）
export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}

// 获取代理对象对应的原始对象
export function toRaw(observed) {
  const raw = observed && observed[ReactiveFlags.RAW]
  return raw ? toRaw(raw) : observed
}

// 根据原始对象创建代理对象
function createReactiveObject(target, baseHandlers, proxyMap) {
  // 判断target是否是一个对象
  if (!isObject(target)) {
    console.warn(`target ${target}必须是一个对象`);
    return target
  }

  // 查找之前是否已经创建过target的代理对象，如果找到了，直接返回已有的代理对象
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  // 创建Proxy代理对象
  const proxy = new Proxy(target, baseHandlers)
  // 存储到map中，避免重复创建
  proxyMap.set(target, proxy)

  return proxy
}
