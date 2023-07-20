import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

/**
 * @description: 创建组件实例的具体函数
 * @param {any} vNode
 * @param {any} type 当前组件实例。从vNode里结构出来的，方便使用
 * @return {*}
 * @author: 小国际
 */
export function createComponentInstance(vNode: any) {
	const component = {
		vNode,
		type: vNode.type,
		setupState: {},
	};

	return component;
}

export function setupComponent(instance) {
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

function setupStatefulComponent(instance: any) {
	const Component = instance.type;
	instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
	const { setup } = Component;
	//有时用户不会写setup()
	if (setup) {
		//setup()返回值：1.对象 2.render函数
		const setupResult = setup();
		handlerSetupResult(instance, setupResult);
	}
}
function handlerSetupResult(instance, setupResult: any) {
	//setup()返回值：Object、Function
	//Object：
	//Function:当成render函数处理
	if (typeof setupResult === "object") {
		//将Object返回值挂载到组件实例上
		instance.setupState = setupResult;
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
