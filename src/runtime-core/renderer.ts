import { createComponentInstance, setupComponent } from "./component";

/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-18 17:26:32
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-19 15:53:47
 */
export function render(vNode, container) {
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
function patch(vNode: any, container: any) {
	//处理组件
	//判断 组件类型
	processElement(vNode, container);
	processComponent(vNode, container);
}
/**
 * @description:
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function processComponent(vNode: any, container: any) {
	mountComponent(vNode, container);
}
function processElement(vNode: any, container: any) {}
/**
 * @description: 创建Component实例，处理props.slot,并挂载到容器上
 * @param {any} vNode
 * @param {any} container
 * @return {*}
 * @author: 小国际
 */
function mountComponent(vNode: any, container: any) {
	const instance = createComponentInstance(vNode);
	setupComponent(instance);
	setupRenderEffect(instance, container);
}
/**
 * @description: 拆箱，调用实例上的render()函数，再递归处理子组件
 * @param {any} instance
 * @param {*} container
 * @return {*}
 * @author: 小国际
 */
function setupRenderEffect(instance: any, container) {
	//调用render()，拿到vNode树
	const subTree = instance.render();
	// 递归处理节点
	patch(subTree, container);
}
