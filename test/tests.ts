import { 
	vDomToHtmlString, 
	vDomToDom, 
	updateDom,
	VChild,
	VDom,
	prepChildren
} from '../src/index'


const Div = 'div'
const A   = 'a'
const Br  = 'br'
const Textarea = 'textarea'


const parent = document.getElementById('tests')


function domToHtmlString (dom) {
	if (!dom) return undefined
	const div = document.createElement('div')
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
	const dom = vDomToDom(vDomA)
	const vDomB2 = vDomB instanceof Array ? vDomB.slice() : vDomB
	parent.appendChild(dom)
	updateDom(vDomA, vDomB, dom, parent)
	return domToHtmlString(parent.firstChild) === vDomToHtmlString(vDomB2)
}


function Child ({ a }): VDom {
	return [Div, {}, [a]]
}


window['results'] = [

	domToHtmlString(vDomToDom('a')) === 'a',
	domToHtmlString(vDomToDom(1)) === '1',
	domToHtmlString(vDomToDom(0)) === '0',
	
	domToHtmlString(vDomToDom([Br])) === '<br>',
	domToHtmlString(vDomToDom([Div, {}, []])) === '<div></div>',
	domToHtmlString(vDomToDom([A, { name: 'x' }])) === '<a name="x"></a>',
	domToHtmlString(vDomToDom([A, { href: '#' }, ['abc']])) === '<a href="#">abc</a>',
	domToHtmlString(vDomToDom([Div, {}, [ 'a', [Div, {}, ['b']], 'c' ]])) === '<div>a<div>b</div>c</div>',

	domToHtmlString(vDomToDom([Div, {}, ['a','b','c']])) === '<div>a b c</div>',
	domToHtmlString(vDomToDom([Div, {}, ['a',false,'b',undefined,null,'c',null]])) === '<div>a b c</div>',

	domToHtmlString(vDomToDom([Child, { a: 1 }])) === '<div>1</div>',
	domToHtmlString(vDomToDom([Div, {}, [[Child, { a: 1 }]]])) === '<div><div>1</div></div>',

	domToHtmlString(vDomToDom([Div, {}, ['']])) === '<div></div>',

	domToHtmlString(vDomToDom([Textarea, {}, ['test']])) === '<textarea>test</textarea>',

	checkUpdate(parent, [Div, {}, []], [Div, {}, ['a']]),
	checkUpdate(parent, [Div, {}, []], [Br]),
	checkUpdate(parent, [Div], 'a'),
	checkUpdate(parent, 'a', 'b'),
	checkUpdate(parent, 'a', [Div]),
	checkUpdate(parent, 1, 0),
	checkUpdate(parent, [Div, {}, ['a','b','c']], [Div, {}, ['123']]),
	checkUpdate(parent, [Div, {}, ['a',false,'b','c']], [Div, {}, ['c',false,'a','b']]),
	checkUpdate(parent, [Div, {}, [undefined,undefined,'a',false,'b','c']], [Div, {}, ['c','d',123,false,'a','b',undefined]]),

	checkUpdate(parent, [Div, {}, ['string']], [Div, {}, ['']]),

	checkUpdate(parent, [Textarea, {}, []], [Textarea, {}, ['test']]),

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
	
]

console.log(window['results'])
