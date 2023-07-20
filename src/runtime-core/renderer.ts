import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-18 17:26:32
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-20 19:45:46
 */
export function render(vNode, container) {
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
function patch(vNode: any, container: any) {
	//处理组件
	//判断 组件类型
	if (typeof vNode.type === "string") {
		processElement(vNode, container);
	} else if (isObject(vNode.type)) {
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
function processComponent(vNode: any, container: any) {
	mountComponent(vNode, container);
}
/**
 * @description: 处理element类型，分为初始化阶段(mount) 和update阶段
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function processElement(vNode: any, container: any) {
	mountElement(vNode, container);
}
/**
 * @description: 创建(初始化)Component实例，处理props.slot,并挂载到容器上
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function mountComponent(initialVNode: any, container: any) {
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
function mountElement(vNode: any, container: any) {
	const { type, props, children } = vNode;
	const el = (vNode.el = document.createElement(type));
	for (const key in props) {
		const value = props[key];
		el.setAttribute(key, value);
	}
	if (typeof children === "string") {
		el.textContent = children;
	} else if (Array.isArray(children)) {
		mountChildren(vNode, el);
	}

	container.append(el);
}
/**
 * @description:初始化children
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function mountChildren(vNode: any, container: any) {
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
function setupRenderEffect(instance: any, initialVNode, container) {
	const proxy = instance.proxy;
	//调用render()，拿到vNode树
	const subTree = instance.render.call(proxy);
	// 递归处理节点
	patch(subTree, container);

	//赋值$el
	initialVNode.el = subTree.el;
}
