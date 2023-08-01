/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-08-01 20:30:12
 * @LastEditors: 小国际
 * @LastEditTime: 2023-08-01 20:30:30
 */
import { NodeTypes } from "../ast";

export function transformExpression(node) {
	if (node.type === NodeTypes.INTERPOLATION) {
		node.content = processExpression(node.content);
	}
}

function processExpression(node) {
	node.content = `_ctx.${node.content}`;
	return node;
}
