import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";
import { ShapeFlags } from "./shapeFlags";

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-18 17:26:32
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-20 20:55:37
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
	const { shapeFlag } = vNode;
	if (shapeFlag & ShapeFlags.ELEMENT) {
		processElement(vNode, container);
	} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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
	const { type, props, children, shapeFlag } = vNode;
	const el = (vNode.el = document.createElement(type));
	for (const key in props) {
		const value = props[key];
		console.log(key);
		const isOn = (key: string) => /^on[A-Z]/.test(key);
		if (isOn(key)) {
			//prop为事件
			const eventName = key.slice(2).toLocaleLowerCase;
			el.addEventListener(eventName, value);
		} else {
			//prop为属性
			el.setAttribute(key, value);
		}
	}
	if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
		el.textContent = children;
	} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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
