test("interpolation module", () => {
	const ast = baseParse("{{hello}}");
	transform(ast, {
		nodeTransforms: [transformExpression],
	});

	const { code } = generate(ast);
	expect(code).toMatchSnapshot();
});

test("element and interpolation", () => {
	const ast = baseParse("<div>hi,{{msg}}</div>");
	transform(ast, {
		nodeTransforms: [transformElement, transformText, transformExpression],
	});

	const { code } = generate(ast);
	expect(code).toMatchSnapshot();
});
