const PublicPropertiesMap = {
	$el: (i) => i.vNode.el,
};

export const PublicInstanceProxyHandlers = {
	get({ _: instance }, key) {
		//获取setup里的状态
		const setupState = instance.setupState;
		if (key in setupState) {
			return setupState[key];
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
