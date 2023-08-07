import { extend, hasChanged, hasOwn, isArray, isObject } from "@min-vue/shared"
import { ITERATE_KEY, pauseTracking, resetTracking, track, trigger } from "./effect"
import { TriggerOpTyes } from "./operations"
import { reactive, ReactiveFlags, readonly, toRaw } from "./reactive"
// 默认的
const get = createGetter()
const set = createSetter()

const readonlyGet = createGetter(true)// 传递参数，创建可读的
const shallowReadonlyGet = createGetter(true, true)// 创建浅只读的

// 对数组操作的函数进行代理重定义
const arrayInstrumentations = createArrayInstrumentations()
function createArrayInstrumentations() {
  const instrumentations = {}
    // 遍历类型的操作
    ;['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
      instrumentations[key] = function (...args) {
        const arr = toRaw(this)// 获取原始对象，拆箱
        // 先在原始对象中找 
        let res = arr[key](...args)
        // 找不到的原因可能是元素也是代理对象，进行拆箱
        if (res === -1 || res === false) {
          return arr[key](...args.map(toRaw))
        } else {
          return res
        }
      }
    })

    ;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
      instrumentations[key] = function (...args) {
        pauseTracking()// 暂停追踪，维护性能
        const res = toRaw(this)[key].apply(this, args)
        resetTracking()// 重置追踪依赖

        return res
      }
    })

  return instrumentations
}



function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key)
    // 访问该 key 属性则会进行判断要进行判断还是依赖追踪
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.RAW) {
      return target
    }
    // 处理数组，如果原型上有该方法，则进行返回该代理的对象
    if (isArray(target) && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key)
    }
    // 浅只读，不需要进行追踪依赖
    if (shallow) {
      return res
    }
    // 如果是可变的对象，并且不是只读的，需要追踪依赖
    if (!isReadonly) {
      track(target, key)
    }
    // 处理需要代理的对象嵌套的情况
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}


function createSetter() {
  return function set(target, key, val, recevier) {
    // 查看是否是新值
    const oldValue = target[key]
    const hadKey = isArray(target) ? Number(key) < target.length : hasOwn(target, key)
    // 进行设置覆盖/新增
    const res = Reflect.set(target, key, val)

    if (target === toRaw(recevier)) {
      if (!hadKey) {// 新增
        trigger(target, TriggerOpTyes.ADD, key)
      } else if (hasChanged(val, oldValue)) {// 重置
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

