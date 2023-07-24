const isObject = (obj) => obj !== null && typeof obj == "object";
/**
 * @description: 判断obj对象是否有key属性
 * @param {any} obj
 * @param {any} key
 * @return {*}
 * @author: 小国际
 */
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
/**
 * @description: 首字母大写
 * @param {string} str
 * @return {*}
 * @author: 小国际
 */
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const camelize = (str) => str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toUpperCase() : "";
});

//缓存所有代理对象
//一个targetMap有多个target,
//一个target有多个key
//一个key有多个dep
const targetMap = new Map();
//触发依赖中的effect()以此更新数据
function trigger(target, key, value) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    //遍历dep,执行每个effect
    for (const effect of dep) {
        //更新时,有scheduler则触发,否则触发run()
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
//重构get,set更具通用性.
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        //判断是否为reactive
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            //判断isReadonly
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        //浅层响应式
        if (isShallow) {
            return res;
        }
        //是对象的话就转为响应式
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    //readonly的数据不可更改
    set(target, key, value) {
        console.warn(`${key} set失败 ,因为target为readonly的`);
        return true;
    },
};
//shallow
const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target, key, value) {
        console.warn(`${key} set失败 ,因为target为readonly的`);
        return true;
    },
};

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-06-30 15:41:05
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-22 20:51:12
 */
function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
    // return new Proxy(
    // 	raw,
    // 	mutableHandlers
    // 	//{
    // 	// get(target, key) {
    // 	// 	//target:代理的对象
    // 	// 	//key:要get的代理对象的属性
    // 	// 	const res = Reflect.get(target, key);
    // 	// 	//TODO 依赖收集
    // 	// 	track(target, key);
    // 	// 	return res;
    // 	// },
    // 	// get: createGetter(),
    // 	// set(target, key, value) {
    // 	// 	const res = Reflect.set(target, key, value);
    // 	// 	//TODO 触发依赖
    // 	// 	trigger(target, key, value);
    // 	// 	return res;
    // 	// },
    // 	// set: createSetter(),
    // 	//}
    // );
}
//readonly不能set,没有track()
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
    // return new Proxy(
    // 	raw,
    // 	readonlyHandlers
    // 	// {
    // 	// 	// get(target, key) {
    // 	// 	// 	const res = Reflect.get(target, key);
    // 	// 	// 	return res;
    // 	// 	// },
    // 	// 	get: createGetter(true),
    // 	// 	// set(target, key, value) {
    // 	// 	// 	throw new Error("readonly不可被更改");
    // 	// 	// },
    // 	// 	set: createSetter(),
    // 	// }
    // );
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(raw, baseHandlers) {
    if (isObject(raw)) {
        console.warn(raw + " 要是一个对象");
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

function emit(instance, eventName, ...args) {
    const { props } = instance;
    // add-->Add
    // add-foo--> AddFoo
    const handlers = props["on" + camelize(capitalize(eventName))];
    handlers && handlers(...args);
}

/**
 * @description: 初始化传给子组件的Props
 * @return {*}
 * @author: 小国际
 */
function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    //
}

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-20 18:12:51
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-23 20:40:47
 */
const PublicPropertiesMap = {
    $el: (i) => i.vNode.el,
    $slots: (i) => i.vNode.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        //获取setup里的状态
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            //如果setup中有这个属性，则直接返回
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            //如果组件的props中有这个属性，也直接返回
            return props[key];
        }
        // if (key === "$el") {
        // 	return instance.vNode.el;
        // }
        const publicGetter = PublicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    //确保children是个数组
    // instance.slots = Array.isArray(children) ? children : [children];
    //slot使object
    const { vNode } = instance;
    const slots = {};
    // {
    // 	footer: h("div", {}, "123");
    //  header: h("div", {}, "456")
    // }
    //如果该虚拟节点为插槽
    if (vNode.shapeFlag === 16 /* ShapeFlags.SLOTS_CHILDREN */) {
        for (const name in children) {
            const slot = children[name];
            slots[name] = (props) => (Array.isArray(slot(props)) ? slot : [slot]);
        }
        instance.slots = slots;
    }
}

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-18 17:39:13
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-24 16:11:11
 */
/**
 * @description: 创建组件实例的具体函数
 * @param {any} vNode
 * @param {any} type 当前组件实例。从vNode里结构出来的，方便使用
 * @return {*}
 * @author: 小国际
 */
function createComponentInstance(vNode, parent) {
    const component = {
        vNode,
        type: vNode.type,
        setupState: {},
        emit: () => { },
        slots: {},
        provides: {},
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vNode.props);
    initSlots(instance, instance.vNode.children);
    setupStatefulComponent(instance);
}
/**
 * @description: 初始化有状态的组件
 * @param {*} instance
 * @return {*}
 * @author: 小国际
 */
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    //有时用户不会写setup()
    if (setup) {
        currentInstance = instance;
        //setup()返回值：1.对象 2.render函数
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        handlerSetupResult(instance, setupResult);
    }
}
function handlerSetupResult(instance, setupResult) {
    //setup()返回值：Object、Function
    //Object：
    //Function:当成render函数处理
    if (typeof setupResult === "object") {
        //将Object返回值挂载到组件实例上
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    //如果组件上有render函数，则将其复制到组件实例上去
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}

const Fragment = Symbol("Fragment");
const Text$1 = Symbol("Text");
function createVNode(type, props, children) {
    const vNode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === "string") {
        vNode.shapeFlag = vNode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vNode.shapeFlag = vNode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    if (vNode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vNode.shapeFlag = 16 /* ShapeFlags.SLOTS_CHILDREN */;
        }
    }
    return vNode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}
/**
 * @description: 创建单纯的文本节点
 * @param {string} string
 * @return {*}
 * @author: 小国际
 */
function createTextVNode(string) {
    return createVNode(Text$1, {}, string);
}

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-18 17:26:32
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-24 16:28:08
 */
function render(vNode, container) {
    //调用patch,递归处理组件
    console.log("container", container);
    console.log("vNode", vNode);
    patch(vNode, container);
}
/**
 * @description: 基于vNode的类型对不同类型组件进行处理
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function patch(vNode, container, parentComponent) {
    //处理组件
    //判断 组件类型
    const { shapeFlag, type } = vNode;
    switch (type) {
        case Fragment:
            processFragment(vNode, container);
            break;
        case Text:
            processText(vNode, container);
            break;
        default:
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                processElement(vNode, container);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                processComponent(vNode, container);
            }
            break;
    }
}
/**
 * @description:处理组件类型
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function processComponent(vNode, container, parentComponent) {
    mountComponent(vNode, container);
}
/**
 * @description: 处理element类型，分为初始化阶段(mount) 和update阶段
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function processElement(vNode, container, parentComponent) {
    mountElement(vNode, container);
}
/**
 * @description: 创建(初始化)Component实例，处理props.slot,并挂载到容器上
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
/**
 * @description: 与上面类似，创建DOM节点，处理props.slot,并挂载到容器上
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function mountElement(vNode, container, parentComponent) {
    const { type, props, children, shapeFlag } = vNode;
    const el = (vNode.el = document.createElement(type));
    for (const key in props) {
        const value = props[key];
        console.log(key);
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            //prop为事件
            const eventName = key.slice(2).toLocaleLowerCase;
            el.addEventListener(eventName, value);
        }
        else {
            //prop为属性
            el.setAttribute(key, value);
        }
    }
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vNode, el);
    }
    container.append(el);
}
/**
 * @description: 处理Fragment
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function processFragment(vNode, container, parentComponent) {
    //遍历所有children,并再次patch。
    mountChildren(vNode, container);
}
/**
 * @description: 创建Text节点
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function processText(vNode, container) {
    const { children } = vNode;
    const TextNode = (vNode.el = document.createTextNode(children));
    container.append(TextNode);
}
/**
 * @description:初始化children
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function mountChildren(vNode, container, parentComponent) {
    vNode.children.forEach((vNode) => {
        patch(vNode, container);
    });
}
/**
 * @description: 拆箱，调用实例上的render()函数，再递归处理子组件
 * @param {any} instance
 * @param {*} container
 * @return {*}
 * @author: 小国际
 */
function setupRenderEffect(instance, initialVNode, container) {
    const proxy = instance.proxy;
    //调用render()，拿到vNode树
    const subTree = instance.render.call(proxy);
    // 递归处理节点
    patch(subTree, container);
    //赋值$el
    initialVNode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vNode = createVNode(rootComponent);
            render(vNode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-23 20:50:30
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-23 22:17:36
 */
function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

/**
 * @description: provider API 存数据
 * @param {*} key
 * @param {*} value
 * @return {*}
 * @author: 小国际
 */
function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { provides } = currentInstance;
        provides[key] = value;
    }
}
/**
 * @description: inject API 取数据
 * @param {*} key
 * @return {*}
 * @author: 小国际
 */
function inject(key) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        return parentProvides[key];
    }
}

export { createApp, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };
