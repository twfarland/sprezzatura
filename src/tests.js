var sprezzatura 		= require('./index.js')


var vDomToHtmlString 	= sprezzatura.vDomToHtmlString
var vDomToDom 			= sprezzatura.vDomToDom
var updateDom 			= sprezzatura.updateDom


var Div = 'div'
var A   = 'a'
var Br  = 'br'


var parent = document.getElementById('tests')


function domToHtmlString (dom) {
	if (!dom) return undefined
	var div = document.createElement('div')
	div.appendChild(dom)
	return div.innerHTML
}


function clearNode (node) {
	while (node.firstChild) {
	    node.removeChild(node.firstChild)
	}
}


function checkUpdate (parent, vDomA, vDomB) {
	clearNode(parent)
	var dom = vDomToDom(vDomA)
	var vDomB2 = vDomB instanceof Array ? vDomB.slice() : vDomB
	parent.appendChild(dom)
	updateDom(vDomA, vDomB, dom, parent)
	return domToHtmlString(parent.firstChild) === vDomToHtmlString(vDomB2)
}


function Child ({ a }) {
	return [Div, {}, [a]]
}


console.log([

	vDomToDom(false) === undefined,
	vDomToDom(null) === undefined,
	vDomToDom(undefined) === undefined,
	vDomToDom([]) === undefined,

	domToHtmlString(vDomToDom('a')) === '<span>a</span>',
	domToHtmlString(vDomToDom(1)) === '<span>1</span>',
	domToHtmlString(vDomToDom(0)) === '<span>0</span>',
	
	domToHtmlString(vDomToDom([Br])) === '<br>',
	domToHtmlString(vDomToDom([Div, {}, []])) === '<div></div>',
	domToHtmlString(vDomToDom([A, { name: 'x' }])) === '<a name="x"></a>',
	domToHtmlString(vDomToDom([A, { href: '#' }, ['abc']])) === '<a href="#"><span>abc</span></a>',
	domToHtmlString(vDomToDom([Div, {}, [ 'a', [Div, {}, ['b']], 'c' ]])) === '<div><span>a</span><div><span>b</span></div><span>c</span></div>',
	domToHtmlString(vDomToDom([Div, {}, ['a','b','c']])) === '<div><span>a</span><span>b</span><span>c</span></div>',
	domToHtmlString(vDomToDom([Div, {}, ['a',false,'b',undefined,null,'c',null]])) === '<div><span>a</span><span>b</span><span>c</span></div>',

	domToHtmlString(vDomToDom([Child, { a: 1 }])) === '<div><span>1</span></div>',
	domToHtmlString(vDomToDom([Div, {}, [[Child, { a: 1 }]]])) === '<div><div><span>1</span></div></div>',

	checkUpdate(parent, [Div, {}, []], [Div, {}, ['a']]),
	checkUpdate(parent, [Div, {}, []], [Br]),
	checkUpdate(parent, [Div], 'a'),
	checkUpdate(parent, 'a', 'b'),
	checkUpdate(parent, 'a', [Div]),
	checkUpdate(parent, 1, 0),
	checkUpdate(parent, [Div, {}, ['a','b','c']], [Div, {}, ['123']]),
	checkUpdate(parent, [Div, {}, ['a',false,'b','c']], [Div, {}, ['c',false,'a','b']]),
	checkUpdate(parent, [Div, {}, [undefined,undefined,'a',false,'b','c']], [Div, {}, ['c','d',123,false,'a','b',undefined]]),

	checkUpdate(parent, 
		[Div, {}, [
			[Div, { key: 1 }],
			[Div, { key: 2 }],
			[Div, { key: 3 }],
		]],
		[Div, {}, [
			[Div, { key: 3 }],
			[Div, { key: 2 }],
			[Div, { key: 1 }],
		]]
	),
	checkUpdate(parent, 
		[Div, {}, [
			[Div, { key: 1 }],
			[Div, { key: 3 }],
		]],
		[Div, {}, [
			[Div, { key: 3 }],
			[Div, { key: 2 }],
			[Div, { key: 1 }],
		]]
	),
	checkUpdate(parent, 
		[Div, {}, [
			[Div, { key: 1 }],
			[Div, { key: 2 }],
			[Div, { key: 3 }],
		]],
		[Div, {}, [
			[Div, { key: 2 }]
		]]
	),
	checkUpdate(parent, 
		[Div, {}, [
			[Div, { key: 1 }],
			[Div, { key: 2 }],
			[Div, { key: 3 }],
		]],
		[Div, {}, []]
	),
	checkUpdate(parent, 
		[Div, {}, []],
		[Div, {}, [
			[Div, { key: 3 }],
			[Div, { key: 2 }],
			[Div, { key: 1 }],
		]]
	),

	checkUpdate(parent, [Child, { a: 1 }], [Child, { a: 2 }]),
	checkUpdate(parent, [Child, { a: 1 }], [A, { href: '#'}, ['x']]),
	checkUpdate(parent, [Div, {}, []], [Child, { a: 1 }])		
])


