import { NodeTypes } from "./ast";

export function baseParse(content: string) {
	const ctx = createParserContext(content);
	return createRoot(parserChildren(ctx, ""));
}

/**
 * @description:解析Children
 * @param {*} ctx
 * @return {*}
 * @author: 小国际
 */
function parserChildren(ctx, ancestors) {
	const nodes: any[] = [];
	while (!shouldEnd(ctx, ancestors)) {
		let node;
		if (ctx.source.startsWith("{{")) {
			//插值表达式类型
			node = parserInterpolation(ctx);
		} else if (ctx.source.startsWith("<")) {
			//element类型
			//尖括号后是字母
			if (/a-z/i.test(ctx.source[1])) {
				node = parserElement(ctx, ancestors);
			}
		}
		if (!node) {
			//TEXT类型
			node = parserText(ctx);
		}
		nodes.push(node);
	}
}

/**
 * @description: 结束循环的条件：
 * 1.当source没有值时
 * 2.遇到结束标签</div>
 *
 * @return {*}
 * @author: 小国际
 */
function shouldEnd(ctx, ancestors) {
	// const s = `</${tag}>`;
	if (ctx.source.startsWith("</")) {
		for (let i = 0; i < ancestors.length; i++) {
			//</div>
			const tag = ancestors[i].tag;
			if (ctx.source.slice(2, 2 + tag.length) === tag) {
				return true;
			}
		}
	}
	return !ctx.source;
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
		type: NodeTypes.ROOT,
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
function parserElement(ctx: any, ancestors) {
	//解析tag
	const element: any = parserTag(ctx);
	//将tag加入栈中
	ancestors.push(element);
	element.children = parserChildren(ctx, ancestors); //递归解析
	element.type = NodeTypes.ELEMENT;
	//收集完所有成对的tag后，将多余的tag删除出栈
	ancestors.pop();
	if (ctx.source.slice(2, element.tag.length) === element.tag) {
		parserTag(ctx);
	} else {
		throw new Error("缺少结束标签");
	}

	return element;
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

	return { tag };
}
/**
 * @description:解析TEXT
 * @param {any} ctx
 * @return {*}
 * @author: 小国际
 */
function parserText(ctx: any): any {
	let endTokens = ["<", "{{"];
	let endIndex = ctx.source.length;
	for (let i = 0; i < endTokens.length; i++) {
		const index = ctx.source.indexOf(endTokens[i]);
		//取"<"、"{{"中最左边的 ：<div><p>xxx</p>{{msg}}</div>
		if (index !== -1 && index < endIndex) {
			endIndex = index;
		}
	}

	//获取内容
	const content = ctx.source.slice(0, endIndex);
	//删除
	ctx.source = ctx.source.slice(content.length);
	return {
		type: NodeTypes.TEXT,
		content: content,
	};
}
