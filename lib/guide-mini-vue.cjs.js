'use strict';

const isObject = (obj) => obj !== null && typeof obj == "object";

/**
 * @description: 创建组件实例的具体函数
 * @param {any} vNode
 * @param {any} type 当前组件实例。从vNode里结构出来的，方便使用
 * @return {*}
 * @author: 小国际
 */
function createComponentInstance(vNode) {
    const component = {
        vNode,
        type: vNode.type,
    };
    return component;
}
function setupComponent(instance) {
    // initProps();
    // initSlots();
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
    const { setup } = Component;
    //有时用户不会写setup()
    if (setup) {
        //setup()返回值：1.对象 2.render函数
        const setupResult = setup();
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

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-18 17:26:32
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-20 17:01:17
 */
function render(vNode, container) {
    //调用patch,递归处理组件
    patch(vNode, container);
}
/**
 * @description: 基于vNode的类型对不同类型组件进行处理
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function patch(vNode, container) {
    //处理组件
    //判断 组件类型
    if (typeof vNode.type === "string") {
        processElement(vNode, container);
    }
    else if (isObject(vNode.type)) {
        processComponent(vNode, container);
    }
}
/**
 * @description:处理组件类型
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function processComponent(vNode, container) {
    mountComponent(vNode, container);
}
/**
 * @description: 处理element类型，分为初始化阶段(mount) 和update阶段
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function processElement(vNode, container) {
    mountElement(vNode, container);
}
/**
 * @description: 创建(初始化)Component实例，处理props.slot,并挂载到容器上
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function mountComponent(vNode, container) {
    const instance = createComponentInstance(vNode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
/**
 * @description: 与上面类似，创建DOM节点，处理props.slot,并挂载到容器上
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function mountElement(vNode, container) {
    const { type, props, children } = vNode;
    const el = document.createElement(type);
    for (const key in props) {
        const value = props[key];
        el.setAttribute(key, value);
    }
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vNode, el);
    }
    container.appendChild(el);
}
/**
 * @description:初始化children
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function mountChildren(vNode, container) {
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
function setupRenderEffect(instance, container) {
    //调用render()，拿到vNode树
    const subTree = instance.render();
    // 递归处理节点
    patch(subTree, container);
}

function createVNode(type, props, children) {
    const vNode = {
        type,
        props,
        children,
    };
    return vNode;
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

exports.createApp = createApp;
exports.h = h;
