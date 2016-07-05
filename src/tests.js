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
	return [domToHtmlString(parent.firstChild), vDomToHtmlString(vDomB2)]
}


console.log([

	vDomToDom(false) === undefined,
	vDomToDom(null) === undefined,
	vDomToDom(undefined) === undefined,
	vDomToDom([]) === undefined,

	domToHtmlString(vDomToDom('a')) === 'a',
	domToHtmlString(vDomToDom('')) === '',
	domToHtmlString(vDomToDom(1)) === '1',
	domToHtmlString(vDomToDom(0)) === '0',

	domToHtmlString(vDomToDom([Br])) === '<br>',
	domToHtmlString(vDomToDom([Div, {}, []])) === '<div></div>',
	domToHtmlString(vDomToDom([A, { name: 'x' }])) === '<a name="x"></a>',
	domToHtmlString(vDomToDom([A, { href: '#' }, ['abc']])) === '<a href="#">abc</a>',
	domToHtmlString(vDomToDom([Div, {}, [ 'a', [Div, {}, ['b']], 'c' ]])) === '<div>a<div>b</div>c</div>',

	checkUpdate(parent, [Div, {}, []], [Div, {}, ['a']]),
	checkUpdate(parent, [Div, {}, []], [Br]),
	checkUpdate(parent, [Div], 'a'),
	checkUpdate(parent, 'a', 'b'),
	checkUpdate(parent, 'a', [Div]),
	checkUpdate(parent, 1, 0)
])