import { effect } from "../reactivity/effect";
import { createComponentInstance, setupComponent } from "./component";
import { createAppAPI } from "./createApp";
import { ShapeFlags } from "./shapeFlags";
import { Fragment } from "./vnode";

export function createRenderer(options) {
	const {
		createElement: hostCreateElement,
		patchProp: hostPatchProp,
		Insert: hostInsert,
		Remove: hostRemove,
		setElementText: hostSetElementText,
	} = options;

	/*
	 * @Description:
	 * @Version: 1.0
	 * @Author: 小国际
	 * @Date: 2023-07-18 17:26:32
	 * @LastEditors: 小国际
	 * @LastEditTime: 2023-07-24 18:13:48
	 */
	function render(vNode, container) {
		//调用patch,递归处理组件
		console.log("container", container);
		console.log("vNode", vNode);
		patch(null, vNode, container, null, null);
	}

	/**
	 * @description: 基于vNode的类型对不同类型组件进行处理
	 * @param n1 老的虚拟节点。如果n1不存在，则说明是初始化，如果存在则为更新逻辑
	 * @param n2 新的虚拟节点
	 * @param {any} vNode
	 * @param {any} container
	 * @return {*}
	 * @author: 小国际
	 */
	function patch(
		n1: any,
		n2: any,
		container: any,
		parentComponent: any,
		anchor: any
	) {
		//处理组件
		//判断 组件类型
		const { shapeFlag, type } = n2;

		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent, anchor);
				break;
			case Text:
				processText(n1, n2, container);
				break;
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(n1, n2, container, parentComponent, anchor);
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(n1, n2, container, parentComponent, anchor);
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
	function processComponent(
		n1: any,
		n2: any,
		container: any,
		parentComponent: any,
		anchor: any
	) {
		if (!n1) {
			//初始化组件
			mountComponent(n2, container, parentComponent, anchor);
		} else {
			//更新组件
			updateComponent(n1, n2, container, parentComponent);
		}
	}
	/**
	 * @description: 处理element类型，分为初始化阶段(mount) 和update阶段
	 * @param {any} vNode
	 * @param {any} container
	 * @return {*}
	 * @author: 小国际
	 */
	function processElement(
		n1: any,
		n2: any,
		container: any,
		parentComponent: any,
		anchor: any
	) {
		if (!n1) {
			//如果n1为null，则表明为初始化
			mountElement(n1, n2, container, parentComponent, anchor);
		} else {
			//n1有值，则表明为更新逻辑
			patchElement(n1, n2, container, parentComponent, anchor);
		}
	}
	/**
	 * @description: 创建(初始化)Component实例，处理props.slot,并挂载到容器上
	 * @param {any} vNode
	 * @param {any} container
	 * @return {*}
	 * @author: 小国际
	 */
	function mountComponent(
		initialVNode: any,
		container: any,
		parentComponent: any,
		anchor
	) {
		const instance = (initialVNode.component = createComponentInstance(
			initialVNode,
			parentComponent
		));
		setupComponent(instance);
		setupRenderEffect(instance, initialVNode, container, anchor);
	}
	/**
	 * @description: 与上面类似，创建DOM节点，处理props.slot,并挂载到容器上
	 * @param {any} vNode
	 * @param {any} container
	 * @return {*}
	 * @author: 小国际
	 */
	function mountElement(
		n1: any,
		n2: any,
		container: any,
		parentComponent: any,
		anchor: any
	) {
		const { type, props, children, shapeFlag } = n2;
		const el = (n2.el = hostCreateElement(type));
		for (const key in props) {
			const value = props[key];
			console.log(key);
			// const isOn = (key: string) => /^on[A-Z]/.test(key);
			// if (isOn(key)) {
			// 	//prop为事件
			// 	const eventName = key.slice(2).toLocaleLowerCase;
			// 	el.addEventListener(eventName, value);
			// } else {
			// 	//prop为属性
			// 	el.setAttribute(key, value);
			// }
			hostPatchProp(el, key, null, value);
		}
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			el.textContent = children;
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			mountChildren(children, el, parentComponent, anchor);
		}

		// container.append(el);
		hostInsert(el, container, anchor);
	}
	/**
	 * @description: 更新虚拟节点
	 * @param {any} n1
	 * @param {any} n2
	 * @param {any} container
	 * @return {*}
	 * @author: 小国际
	 */
	const EMPTY_OBJ = {};
	function patchElement(
		n1: any,
		n2: any,
		container: any,
		parentComponent: any,
		anchor: any
	) {
		console.log("更新：patchElement");
		console.log("n1:  " + n1);
		console.log("n2:  " + n2);

		const oldProps = n1.props || EMPTY_OBJ;
		const newProps = n2.props || EMPTY_OBJ;
		const el = (n2.el = n1.el);
		patchChild(n1, n2, el, parentComponent, anchor);
		patchProps(el, oldProps, newProps);
	}
	/**
	 * @description: 更新组件
	 * @param {any} n1
	 * @param {any} n2
	 * @param {any} container
	 * @param {any} anchor
	 * @return {*}
	 * @author: 小国际
	 */
	function updateComponent(n1: any, n2: any, container: any, anchor: any) {
		const instance = (n2.component = n1.component);

		if (shouldUpdateComponent(n1, n2)) {
			instance.next = n2;
			instance.update();
		} else {
			n2.el = n1.el;
			instance.vNode = n2;
		}
	}
	/**
	 * @description:更新props
	 * @return {*}
	 * @author: 小国际
	 */
	function patchProps(el: any, oldProps: any, newProps: any) {
		if (newProps !== oldProps) {
			for (const key in newProps) {
				const oldPropVal = oldProps[key];
				const newPropVal = newProps[key];
				if (oldPropVal !== newPropVal) {
					hostPatchProp(el, key, oldPropVal, newPropVal);
				}
			}
			//如果老props为空对象，这直接不做判断，避免性能浪费
			if (oldProps.length === EMPTY_OBJ) return;
			//遍历oldProps,如果老的属性不在props上了，则删除
			for (const key in oldProps) {
				if (!(key in newProps)) {
					hostPatchProp(el, key, oldProps[key], null);
				}
			}
		}
	}
	/**
	 * @description: 更新children
	 * @param {any} n1
	 * @param {any} n2
	 * @return {*}
	 * @author: 小国际
	 */
	function patchChild(
		n1: any,
		n2: any,
		container: any,
		parentComponent: any,
		anchor: any
	) {
		const oldShapeFlag = n1.shapeFlag;
		const shapeFlag = n2.shapeFlag;
		const text1 = n1.children;
		const text2 = n2.children;

		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			//新的为TEXT
			if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
				//新TEXT老Array
				unmountChildren(n1.children);
				//1.将老的清空
				//2.赋值新的TEX
				hostSetElementText(container, text2);
			} else {
				//新旧都为TEXT
				//1.对比新旧TEXT
				if (text1 !== text2) {
					hostCreateElement(container, text2);
				}
			}
		} else {
			//新的为Array
			if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
				// 新为Array旧为TEXT
				//1.清空TEXT
				hostSetElementText(container, "");
				//2.赋值
				mountChildren(n2.children, container, parentComponent, anchor);
			} else {
				//*老Array新Array diff算法
				patchKeyedChildren(
					n1.children,
					n2.children,
					container,
					parentComponent,
					anchor
				);
			}
		}
	}

	function unmountChildren(children: any) {
		for (let i = 0; i < children.length; i++) {
			const el = children[i].el;
			//remove
			hostRemove(el);
		}
	}
	/**
	 * @description: 使用diff算法对比新旧两个数组
	 * @param {any} c1
	 * @param {any} c2
	 * @return {*}
	 * @author: 小国际
	 */
	function patchKeyedChildren(
		c1: any,
		c2: any,
		container: any,
		parentComponent: any,
		parentAnchor: any
	) {
		let i = 0;
		let e1 = c1.length - 1;
		let e2 = c2.length - 1;
		//左侧
		while (i <= e1 && i <= e2) {
			const n1 = c1[i]; //一个老节点
			const n2 = c2[i]; //新节点
			//如果新旧节点一样
			if (isSameNode(n1, n2)) {
				//继续递归，对子孙节点继续判断
				patch(n1, n2, container, parentComponent, parentAnchor);
			} else {
				break;
			}
			//指针右移
			i++;
		}

		//右侧
		while (i <= e1 && i <= e1) {
			const n1 = c1[e1]; //老节点
			const n2 = c2[e2]; //新节点
			if (isSameNode(n1, n2)) {
				patch(n1, n2, container, parentComponent, parentAnchor);
			} else {
				break;
			}
			//指针左移
			e1--;
			e2--;
		}

		//新的比老的长：在头部或尾部插入新的
		if (i > e1) {
			if (i <= e2) {
				const nextPos = e2 + 1;
				const anchor = nextPos < c2.length ? c2[nextPos].el : null;
				while (i <= e2) {
					//创建新节点
					patch(null, c2[i], container, parentComponent, anchor);
					i++;
				}
			}
		} else if (i > e2) {
			//老的比新的长,删除老的
			while (i <= e1) {
				hostRemove(c1[i].el);
				i++;
			}
		} else {
			//乱序部分：中间对比
			let s1 = i; //老节点的开始
			let s2 = i;
			let moved = false;
			let maxNewIndexSofar = 0;
			//如果所有新节点都在老节点中，那么不必再继续遍历老节点了，只需把老节点中剩余的直接删除。
			const toBePatched = s2 - s1 - 1; //标记新节点总个数
			let patched = 0; //标记已经处理的新节点的个数
			//如果两者相等，则说明所有新节点都处理完了。

			/*  */
			const newIndexToOldIndexMap = new Array(toBePatched);

			//初始化
			for (let i = 0; i < toBePatched; i++) {
				newIndexToOldIndexMap[i] = 0;
			}
			const keyToNewIndexMap = new Map(); //映射表
			//建立新节点乱序部分的映射表(key,index)
			for (let i = s2; i <= e2; i++) {
				const newChild = c2[i];
			}

			//开始对比
			for (let i = s1; i <= e1; i++) {
				const oldChild = c1[i]; //老节点的乱序部分
				let newIndex; //老节点在新节点中的索引，如果为undefined则说明不在新节点中

				//新老中未删除的节点已经处理完了，不必再遍历老节点了
				if (patched >= toBePatched) {
					hostRemove(oldChild);
					continue;
				}

				//如果有key则根据映射表查
				//查找老节点是否在新节点的映射表中 O(1)
				if (oldChild.key !== null) {
					newIndex = keyToNewIndexMap.get(oldChild.key);
				} else {
					//没有key,则遍历查找 O(n)
					for (let j = s2; j <= e2; j++) {
						if (isSameNode(oldChild, c2[j])) {
							//老节点在新节点中,更新index的值
							newIndex = j;
							break;
						}
					}
				}

				//旧节点不在新节点中，则删除该旧节点
				if (newIndex === undefined) {
					hostRemove(oldChild.el);
				} else {
					if (newIndex > maxNewIndexSofar) {
						maxNewIndexSofar = newIndex;
					} else {
						moved = true;
					}
					newIndexToOldIndexMap[newIndex - s2] = i + 1;
					//在则继续递归遍历子节点

					patch(oldChild, c2[newIndex], container, parentComponent, null);
					patched++;
				}
			}

			const increasingNewIndexSequence = moved
				? getSequence(newIndexToOldIndexMap)
				: [];
			let j = increasingNewIndexSequence.length - 1;

			for (let i = toBePatched - 1; i > 0; i--) {
				const nextIndex = i + s2;
				const newChild = c2[nextIndex];
				const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
				//创建节点
				if (newIndexToOldIndexMap[i] === 0) {
					patch(null, newChild, container, parentComponent, anchor);
				} else if (moved) {
					if (j < 0 || i !== increasingNewIndexSequence[j]) {
						console.log("移动位置");
						hostInsert(newChild.el, container, anchor);
					} else {
						j--;
					}
				}
			}
			//1.创建新的
			//2.删除老的
			//3.节点移动
		}
	}
	/**
	 * @description: 基于type和key判断两个节点是否一样
	 * @param {any} n1
	 * @param {any} n2
	 * @return {*}
	 * @author: 小国际
	 */
	function isSameNode(n1: any, n2: any) {
		return n1.type === n2.type && n1.key === n2.key;
	}
	/**
	 * @description: 处理Fragment
	 * @param {any} vNode
	 * @param {any} container
	 * @return {*}
	 * @author: 小国际
	 */
	function processFragment(
		n1: any,
		n2: any,
		container: any,
		parentComponent: any,
		anchor: any
	) {
		//遍历所有children,并再次patch。
		mountChildren(n2.children, container, parentComponent, anchor);
	}
	/**
	 * @description: 创建Text节点
	 * @param {any} vNode
	 * @param {any} container
	 * @return {*}
	 * @author: 小国际
	 */
	function processText(n1: any, n2: any, container: any) {
		const { children } = n2;
		const TextNode = (n2.el = document.createTextNode(children));
		container.append(TextNode);
	}

	/**
	 * @description:初始化children
	 * @param {any} children
	 * @param {any} container
	 * @return {*}
	 * @author: 小国际
	 */
	function mountChildren(
		children: any,
		container: any,
		parentComponent: any,
		anchor: any
	) {
		children.forEach((v) => {
			patch(null, v, container, parentComponent, anchor);
		});
	}

	/**
	 * @description: 拆箱，调用实例上的render()函数，再递归处理子组件
	 * @param {any} instance
	 * @param {*} container
	 * @return {*}
	 * @author: 小国际
	 */
	function setupRenderEffect(instance: any, initialVNode, container, anchor) {
		instance.update = effect(() => {
			if (!instance.isMounted) {
				console.log("init");
				const proxy = instance.proxy;
				//调用render()，拿到vNode树
				const subTree = (instance.subTree = instance.render.call(proxy));
				console.log(`subtree:------->${subTree}`);
				// 递归处理节点
				patch(null, subTree, container, instance, anchor);
				//赋值$el
				initialVNode.el = subTree.el;

				instance.isMounted = true;
			} else {
				console.log("update");
				const proxy = instance.proxy;
				const prevSubTree = instance.subTree;
				//next:最新的虚拟节点 vNode:旧的虚拟节点
				const { next, vNode } = instance;
				if (next) {
					next.el = vNode.el;
					updateComponentPreRender(instance, next);
				}
				//调用render()，拿到vNode树
				const subTree = instance.render.call(proxy);
				//更新组件实例上的subTree,保证每次组件实例上的都是上一次的subTree
				instance.subTree = subTree;
				console.log("old subTree:------->" + prevSubTree);
				console.log(`new subTree:------->${subTree}`);
				patch(prevSubTree, subTree, container, instance, anchor);
			}
		});
	}

	return {
		createApp: createAppAPI(render),
	};
}

/**
 * @description: 获取最长递增子序列
 * @param {number} arr
 * @return {*} 返回最长递增子序列的索引数组
 * @author: 小国际
 */
function getSequence(arr: number[]): number[] {
	const p = arr.slice();
	const result = [0];
	let i, j, u, v, c;
	const len = arr.length;
	for (i = 0; i < len; i++) {
		const arrI = arr[i];
		if (arrI !== 0) {
			j = result[result.length - 1];
			if (arr[j] < arrI) {
				p[i] = j;
				result.push(i);
				continue;
			}
			u = 0;
			v = result.length - 1;
			while (u < v) {
				c = (u + v) >> 1;
				if (arr[result[c]] < arrI) {
					u = c + 1;
				} else {
					v = c;
				}
			}
			if (arrI < arr[result[u]]) {
				if (u > 0) {
					p[i] = result[u - 1];
				}
				result[u] = i;
			}
		}
	}
	u = result.length;
	v = result[u - 1];
	while (u-- > 0) {
		result[u] = v;
		v = p[v];
	}
	return result;
}

/**
 * @description: 更新组件实例上的一些属性
 * @param {any} instance
 * @param {any} nextVNode
 * @return {*}
 * @author: 小国际
 */
function updateComponentPreRender(instance: any, nextVNode: any) {
	instance.vNode = nextVNode;
	instance.next = null;
	instance.props = nextVNode.props;
}

/**
 * @description: 比较新旧节点的props是否由有更改，如果更改则执行更新
 * @param {*} n1
 * @param {*} n2
 * @return {*}
 * @author: 小国际
 */
function shouldUpdateComponent(n1, n2) {
	const { props: oldProps } = n1;
	const { props: newProps } = n2;
	for (const key in newProps) {
		if (newProps[key] !== oldProps[key]) {
			return true;
		}
	}
	return false;
}
