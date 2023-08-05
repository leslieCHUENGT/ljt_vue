import { extend, hasChanged, hasOwn, isArray, isObject } from "@min-vue/shared"
import { ITERATE_KEY, pauseTracking, resetTracking, track, trigger } from "./effect"
import { TriggerOpTyes } from "./operations"
import { reactive, ReactiveFlags, readonly, toRaw } from "./reactive"

// 创建默认的getter和setter
const get = createGetter()
const set = createSetter()

// 创建只读的getter
const readonlyGet = createGetter(true)

// 创建浅只读的getter
const shallowReadonlyGet = createGetter(true, true)

// 创建数组操作的函数
const arrayInstrumentations = createArrayInstrumentations()
function createArrayInstrumentations() {
  const instrumentations = {}

    // 遍历需要处理的数组操作函数
    // 例如：includes、indexOf、lastIndexOf等
    ;['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
      // 将数组操作函数包装成代理对象的方法
      instrumentations[key] = function (...args) {
        const arr = toRaw(this)
        // 在原始对象中执行数组操作函数
        let res = arr[key](...args)
        // 如果操作函数返回-1或false，则表示在代理对象中未找到，需要在原始对象中再次执行
        if (res === -1 || res === false) {
          return arr[key](...args.map(toRaw))
        } else {
          return res
        }
      }
    })

    // 遍历需要处理的数组操作函数
    // 例如：push、pop、shift、unshift、splice等
    ;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
      // 将数组操作函数包装成代理对象的方法
      instrumentations[key] = function (...args) {
        // 暂停追踪依赖
        pauseTracking()
        // 在原始对象中执行数组操作函数
        const res = toRaw(this)[key].apply(this, args)
        // 重置追踪依赖
        resetTracking()

        return res
      }
    })

  return instrumentations
}

// 创建getter函数
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key)

    // 处理特殊的内部标记属性
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.RAW) {
      return target
    }

    // 如果是代理的数组对象，并且需要处理的是数组操作函数，则返回对应的包装方法
    if (isArray(target) && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key)
    }

    // 如果是浅只读，直接返回值
    if (shallow) {
      return res
    }

    // 如果是可变的对象，并且不是只读的，需要追踪依赖
    if (!isReadonly) {
      track(target, key)
    }

    // 如果返回的值仍然是对象，则根据只读或可变状态进行递归处理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

// 创建setter函数
function createSetter() {
  return function set(target, key, val, recevier) {
    const oldValue = target[key]
    const hadKey = isArray(target) ? Number(key) < target.length : hasOwn(target, key)
    const res = Reflect.set(target, key, val)

    // 如果修改的是目标对象本身
    if (target === toRaw(recevier)) {
      // 如果属性之前不存在，则触发ADD操作
      if (!hadKey) {
        trigger(target, TriggerOpTyes.ADD, key)
        // 如果属性值发生改变，则触发SET操作
      } else if (hasChanged(val, oldValue)) {
        trigger(target, TriggerOpTyes.SET, key)
      }
    }

    return res
  }
}

// 删除属性时触发事件
function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key)

  const result = Reflect.deleteProperty(target, key)

  if (result && hadKey) {
    trigger(target, TriggerOpTyes.DELETE, key)
  }

  return result
}

// 判断属性是否存在时触发事件
function has(target, key) {
  const result = Reflect.has(target, key)
  track(target, key)
  return result
}

// 获取对象的键列表时触发事件
function ownKeys(target) {
  track(target, isArray(target) ? 'length' : ITERATE_KEY)
  return Reflect.ownKeys(target)
}

// 可变对象的处理器
export const mutableHandler = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}

// 只读对象的处理器
export const readonlyHandler = {
  get: readonlyGet,
  set(target, key, val) {
    console.warn(`key: ${key} set 失败  因为target是readonly`, target);

    return true
  },
  deleteProperty(target, key) {
    console.warn(`key: ${key} del 失败  因为target是readonly`, target);

    return true
  }
}

// 浅只读对象的处理器
export const shallowReadonlyHandlers = extend({}, readonlyHandler, {
  get: shallowReadonlyGet
})
