import { NodeTypes } from "./ast";

export function baseParser(content: string) {
	const ctx = createParserContext(content);
	return createRoot(parserChildren(ctx));
}

/**
 * @description:解析Children
 * @param {*} ctx
 * @return {*}
 * @author: 小国际
 */
function parserChildren(ctx) {
	const nodes: any[] = [];
	let node;
	if (ctx.source.startsWith("{{")) {
		//插值表达式类型
		node = parserInterpolation(ctx);
	} else if (ctx.source.startsWith("<")) {
		//element类型
		//尖括号后是字母
		if (/a-z/i.test(ctx.source[1])) {
			node = parserElement(ctx);
		}
	}
	if (!node) {
		//TEXT类型
		node = parserText(ctx);
	}
	nodes.push(node);

	return nodes;
}
/**
 * @description: 解析插值表达式:{{}}
 * @return {*}
 * @author: 小国际
 */
function parserInterpolation(ctx) {
	//截取{{xxx}}中间的字符串
	const closeIndex = ctx.source.indexOf("}}", 2);
	ctx.source = ctx.source.slice(2); // xxx}}
	const contentLength = closeIndex - 2;
	//content: 变量名的字符串形式（不包含花括号）
	const content = ctx.source.slice(0, contentLength).trim();
	//清空source
	ctx.source = ctx.source.slice(contentLength + 2);
	return {
		type: NodeTypes.INTERPOLATION,
		content: {
			type: NodeTypes.SIMPLE_EXPRESSION,
			content: content,
		},
	};
}
function createRoot(children) {
	return {
		children,
	};
}
function createParserContext(content: string) {
	return {
		source: content,
	};
}
/**
 * @description: 解析element类型：<div>zxs</div>
 * @param {any} ctx
 * @return {*}
 * @author: 小国际
 */
function parserElement(ctx: any) {
	//解析tag
	const element = parserTag(ctx);
	parserTag(ctx);
	return {
		type: NodeTypes.ELEMENT,
		content: element,
	};
}

function parserTag(ctx) {
	//示例:<div> </div>
	const match: any = /^\/?<([a-z]>*)/i.exec(ctx.source);
	const tag = match[1]; //正则里的括号捕获组: div></div>
	//处理完成后，删除字符串，只保留标签
	//1.删除左尖括号 <div
	ctx.source = ctx.source.slice(match[0].length);
	//2.删除右尖括号 >
	ctx.source = ctx.source.slice(1);
	return tag;
}
/**
 * @description:解析TEXT
 * @param {any} ctx
 * @return {*}
 * @author: 小国际
 */
function parserText(ctx: any): any {
	//获取内容
	const content = ctx.source.slice(0, ctx.source.length);
	//删除
	ctx.source = ctx.source.slice(content.length);
	return {
		type: NodeTypes.TEXT,
		content: content,
	};
}
