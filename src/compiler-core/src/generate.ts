import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import {
	CREATE_ELEMENT_VNODE,
	TO_DISPLAY_STRING,
	helperNameMap,
} from "./runtimeHelpers";

export function generate(ast) {
	const context = createCodeGeneratorContext();
	const { code, push } = context;
	generateDeclareVar(ast, context);
	push(" return");
	const functionName = "render";
	const args = ["_ctx", "_cache"];
	const signature = args.join(", ");
	//函数头
	push(`function ${functionName}(${signature}){`);
	//函数体
	console.log(ast);
	push("return ");
	//生成节点
	const node = ast.codegenNode;
	generateNode(node, context);
	//结束花括号
	push("}");
	return { code };
}
/**
 * @description: 生成变量定义："const { toDisplayString: _toDisplayString } = _Vue"
 * @param {*} ast
 * @param {*} context
 * @return {*}
 * @author: 小国际
 */
function generateDeclareVar(ast, context) {
	const { push } = context;
	const VueBinging = "Vue";

	const aliasHelper = (s) => `${helperNameMap[s]} : _${helperNameMap[s]}`;

	if (ast.helpers.length > 0) {
		push(
			`const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging} `
		);
	}
	push("\n");
	push(`return`);
}
/**
 * @description: 生成主体内容
 * @param {*} node
 * @param {*} ctx
 * @return {*}
 * @author: 小国际
 */
function generateNode(node, ctx) {
	const { code, push } = ctx;
	switch (node.type) {
		case NodeTypes.TEXT:
			generateText(node, ctx);
		case NodeTypes.INTERPOLATION:
			generateInterpolation(node, ctx);
			break;
		case NodeTypes.SIMPLE_EXPRESSION:
			generateExpression(node, ctx);
			break;
		case NodeTypes.ELEMENT:
			generateElement(node, ctx);
			break;
		case NodeTypes.COMPOUND_EXPRESSION:
			generateCompoundExpression(node, ctx);
			break;
		default:
			break;
	}
}
/**
 * @description: 生成文本类型: "return 'message'"
 * @param {*} node
 * @param {*} ctx
 * @return {*}
 * @author: 小国际
 */
function generateText(node, ctx) {
	const { push } = ctx;
	push(`return '${node.content}'`);
}
/**
 * @description: 生成插值表达式类型: "return _toDisplayString(_ctx.message)"
 * @param {*} node
 * @param {*} ctx
 * @return {*}
 * @author: 小国际
 */
function generateInterpolation(node, ctx) {
	const { push } = ctx;
	/* node: 
  {
    content:{
      content:'message'
    }
  } */
	push(`_${helperNameMap[TO_DISPLAY_STRING]}(${generateNode(node, ctx)})`);
}
/**
 * @description: 生成表达式部分："_ctx.message"
 * @param {any} node
 * @param {any} ctx
 * @return {*}
 * @author: 小国际
 */
function generateExpression(node: any, ctx: any) {
	const { push } = ctx;
	push(`_ctx.${node.content}`);
}
/**
 * @description: 生成text,插值 组合类型："hi," + _toDisplayString(_ctx.message)
 * @param {any} node
 * @param {any} ctx
 * @return {*}
 * @author: 小国际
 */
function generateCompoundExpression(node: any, ctx: any) {
	const { push } = ctx;
	const children = node.children;
	for (let i = 0; i < children.length; i++) {
		if (isString(children[i])) {
			push(children[i]);
		} else {
			generateNode(node, ctx);
		}
	}
}
/**
 * @description:生成Element类型 ：return (_openBlock(), _createElementBlock("div"))
 * @param {any} node
 * @param {any} ctx
 * @return {*}
 * @author: 小国际
 */
function generateElement(node: any, ctx: any) {
	const { push } = ctx;
	const { tag, children } = node;
	/* 
  node:
  {
    type:1,
    tag:"div",
    children:[
      {
        type:3,
        content:"hi,"
      },
      {
        type:0,
        content:{
          type:1,
          content:"message"
        }
      }
    ]
  }
  */
	push(
		`${helperNameMap[CREATE_ELEMENT_VNODE]}("${tag}",null,${generateNode(
			children[0],
			ctx
		)})`
	);
}

/**
 * @description: 建立generate context上下文
 * @return {*}
 * @author: 小国际
 */
function createCodeGeneratorContext(): any {
	const context = {
		code: "",
		push(string) {
			context.code += string;
		},
	};
	return context;
}
