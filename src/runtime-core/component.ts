/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-18 17:39:13
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-27 16:39:08
 */
import { proxyRefs } from "../reactivity";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlot";

/**
 * @description: 创建组件实例的具体函数
 * @param {any} vNode
 * @param {any} type 当前组件实例。从vNode里结构出来的，方便使用
 * @return {*}
 * @author: 小国际
 */
export function createComponentInstance(vNode: any, parent) {
	const component = {
		vNode,
		type: vNode.type,
		setupState: {},
		emit: () => {},
		slots: {},
		provides: parent ? parent.provides : {},
		parent,
		isMounted: false,
		subTree: {},
		next: null,
		update: () => {},
	};
	component.emit = emit.bind(null, component) as any;
	return component;
}

export function setupComponent(instance) {
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

function setupStatefulComponent(instance: any) {
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

function handlerSetupResult(instance, setupResult: any) {
	//setup()返回值：Object、Function
	//Object：
	//Function:当成render函数处理
	if (typeof setupResult === "object") {
		//将Object返回值挂载到组件实例上
		instance.setupState = proxyRefs(setupResult);
	}
	finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
	const Component = instance.type;
	//如果组件上有render函数，则将其复制到组件实例上去
	if (Component.render) {
		instance.render = Component.render;
	}
}
let currentInstance = null;
export function getCurrentInstance() {
	return currentInstance;
}
