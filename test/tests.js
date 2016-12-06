/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var index_1 = __webpack_require__(1);
	var Div = 'div';
	var A = 'a';
	var Br = 'br';
	var parent = document.getElementById('tests');
	function domToHtmlString(dom) {
	    if (!dom)
	        return undefined;
	    var div = document.createElement('div');
	    div.appendChild(dom);
	    return div.innerHTML;
	}
	function clearNode(node) {
	    while (node.firstChild) {
	        node.removeChild(node.firstChild);
	    }
	}
	function checkUpdate(parent, vDomA, vDomB) {
	    clearNode(parent);
	    var dom = index_1.vDomToDom(vDomA);
	    var vDomB2 = vDomB instanceof Array ? vDomB.slice() : vDomB;
	    parent.appendChild(dom);
	    index_1.updateDom(vDomA, vDomB, dom, parent);
	    return domToHtmlString(parent.firstChild) === index_1.vDomToHtmlString(vDomB2);
	}
	function Child(_a) {
	    var a = _a.a;
	    return [Div, {}, [a]];
	}
	window['results'] = [
	    domToHtmlString(index_1.vDomToDom('a')) === '<span>a</span>',
	    domToHtmlString(index_1.vDomToDom(1)) === '<span>1</span>',
	    domToHtmlString(index_1.vDomToDom(0)) === '<span>0</span>',
	    domToHtmlString(index_1.vDomToDom([Br])) === '<br>',
	    domToHtmlString(index_1.vDomToDom([Div, {}, []])) === '<div></div>',
	    domToHtmlString(index_1.vDomToDom([A, { name: 'x' }])) === '<a name="x"></a>',
	    domToHtmlString(index_1.vDomToDom([A, { href: '#' }, ['abc']])) === '<a href="#"><span>abc</span></a>',
	    domToHtmlString(index_1.vDomToDom([Div, {}, ['a', [Div, {}, ['b']], 'c']])) === '<div><span>a</span><div><span>b</span></div><span>c</span></div>',
	    domToHtmlString(index_1.vDomToDom([Div, {}, ['a', 'b', 'c']])) === '<div><span>a</span><span>b</span><span>c</span></div>',
	    domToHtmlString(index_1.vDomToDom([Div, {}, ['a', false, 'b', undefined, null, 'c', null]])) === '<div><span>a</span><span>b</span><span>c</span></div>',
	    domToHtmlString(index_1.vDomToDom([Child, { a: 1 }])) === '<div><span>1</span></div>',
	    domToHtmlString(index_1.vDomToDom([Div, {}, [[Child, { a: 1 }]]])) === '<div><div><span>1</span></div></div>',
	    checkUpdate(parent, [Div, {}, []], [Div, {}, ['a']]),
	    checkUpdate(parent, [Div, {}, []], [Br]),
	    checkUpdate(parent, [Div], 'a'),
	    checkUpdate(parent, 'a', 'b'),
	    checkUpdate(parent, 'a', [Div]),
	    checkUpdate(parent, 1, 0),
	    checkUpdate(parent, [Div, {}, ['a', 'b', 'c']], [Div, {}, ['123']]),
	    checkUpdate(parent, [Div, {}, ['a', false, 'b', 'c']], [Div, {}, ['c', false, 'a', 'b']]),
	    checkUpdate(parent, [Div, {}, [undefined, undefined, 'a', false, 'b', 'c']], [Div, {}, ['c', 'd', 123, false, 'a', 'b', undefined]]),
	    checkUpdate(parent, [Div, {}, [
	            [Div, { key: 1 }],
	            [Div, { key: 2 }],
	            [Div, { key: 3 }],
	        ]], [Div, {}, [
	            [Div, { key: 3 }],
	            [Div, { key: 2 }],
	            [Div, { key: 1 }],
	        ]]),
	    checkUpdate(parent, [Div, {}, [
	            [Div, { key: 1 }],
	            [Div, { key: 3 }],
	        ]], [Div, {}, [
	            [Div, { key: 3 }],
	            [Div, { key: 2 }],
	            [Div, { key: 1 }],
	        ]]),
	    checkUpdate(parent, [Div, {}, [
	            [Div, { key: 1 }],
	            [Div, { key: 2 }],
	            [Div, { key: 3 }],
	        ]], [Div, {}, [
	            [Div, { key: 2 }]
	        ]]),
	    checkUpdate(parent, [Div, {}, [
	            [Div, { key: 1 }],
	            [Div, { key: 2 }],
	            [Div, { key: 3 }],
	        ]], [Div, {}, []]),
	    checkUpdate(parent, [Div, {}, []], [Div, {}, [
	            [Div, { key: 3 }],
	            [Div, { key: 2 }],
	            [Div, { key: 1 }],
	        ]]),
	    checkUpdate(parent, [Child, { a: 1 }], [Child, { a: 2 }]),
	    checkUpdate(parent, [Child, { a: 1 }], [A, { href: '#' }, ['x']]),
	    checkUpdate(parent, [Div, {}, []], [Child, { a: 1 }])
	];
	console.log(window['results']);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var dift_1 = __webpack_require__(2);
	var STRING = 'string';
	var NUMBER = 'number';
	var FUNCTION = 'function';
	var KEY = 'key';
	var VALUE = 'value';
	var CHECKED = 'checked';
	var SELECTED = 'selected';
	var DISABLED = 'disabled';
	var FOCUS = 'focus';
	var ON = 'on';
	var EMPTYSTRING = '';
	var VOID_ELEMENTS = { area: 1, base: 1, br: 1, col: 1, command: 1, embed: 1, hr: 1, img: 1, input: 1, keygen: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1 };
	var VATOM = 0;
	var VNODE = 1;
	var VCHILD = 2;
	var VNULL = 3;
	function getType(vDom) {
	    if (vDom instanceof Array) {
	        return typeof vDom[0] === FUNCTION ? VCHILD : VNODE;
	    }
	    else if (typeof vDom === STRING || typeof vDom === NUMBER) {
	        return VATOM;
	    }
	    else {
	        return VNULL;
	    }
	}
	function keyOf(v, i) {
	    return (v instanceof Array && v[1] && v[1].key) || i;
	}
	function groupChildren(vDoms, DChildren) {
	    var res = [];
	    var v;
	    var i;
	    for (i = 0; i < vDoms.length; i++) {
	        v = vDoms[i];
	        res.push({ key: keyOf(v, i), vDom: v, element: DChildren && DChildren[i] });
	    }
	    return res;
	}
	function getKey(v) {
	    return v.key;
	}
	function isDefined(v) {
	    return !(v === false || v === undefined || v === null);
	}
	function updateChildren(current, next, D) {
	    next[2] = next[2] ? next[2].filter(isDefined) : []; // !! mutates vDom !!
	    dift_1["default"](groupChildren(current[2] || [], D.childNodes), groupChildren(next[2]), function effect(type, current, next, pos) {
	        var newNode;
	        switch (type) {
	            case dift_1.CREATE:
	                newNode = vDomToDom(next.vDom);
	                if (newNode)
	                    D.insertBefore(newNode, D.childNodes[pos] || null);
	                break;
	            case dift_1.UPDATE:
	                updateDom(current.vDom, next.vDom, current.element, D);
	                break;
	            case dift_1.MOVE:
	                D.insertBefore(updateDom(current.vDom, next.vDom, current.element, D), current.element);
	                break;
	            case dift_1.REMOVE:
	                D.removeChild(current.element);
	                break;
	        }
	    }, getKey);
	    return D;
	}
	function updateDom(current, next, D, DParent) {
	    if (D === undefined) {
	        throw new Error('No dom node to update');
	    }
	    if (current === next) {
	        return;
	    }
	    var currentExists = current !== undefined;
	    var nextExists = next !== undefined;
	    var newNode;
	    if (!currentExists && nextExists) {
	        newNode = vDomToDom(next);
	        if (newNode) {
	            DParent.appendChild(newNode);
	        }
	    }
	    else if (currentExists && !nextExists) {
	        DParent.removeChild(D);
	    }
	    else if (currentExists && nextExists) {
	        var currentType = getType(current);
	        var nextType = getType(next);
	        if (shouldExploreFurther(current, next, currentType, nextType)) {
	            switch (nextType) {
	                case VNODE:
	                    updateAttributes(current[1] || {}, next[1] || {}, D);
	                    updateChildren(current, next, D);
	                    break;
	                case VCHILD:
	                    if (next[0].shouldUpdate ?
	                        next[0].shouldUpdate(current[1], next[1]) :
	                        next[1] && current[1] && next[1] !== current[1]) {
	                        next[2] = next[0](next[1]);
	                        updateAttributes(current[2][1] || {}, next[2][1] || {}, D);
	                        updateChildren(current[2], next[2], D);
	                    }
	                    else {
	                        next[2] = current[2];
	                    }
	                    break;
	            }
	        }
	        else if (current !== next) {
	            newNode = vDomToDom(next);
	            if (newNode) {
	                DParent.replaceChild(newNode, D);
	            }
	        }
	    }
	    return D;
	}
	exports.updateDom = updateDom;
	function updateAttributes(currentAttrs, nextAttrs, D) {
	    var a;
	    var currentVal;
	    var nextVal;
	    var evt;
	    var currentEvts = currentAttrs[ON];
	    var nextEvts = nextAttrs[ON];
	    for (a in currentAttrs) {
	        currentVal = currentAttrs[a];
	        nextVal = nextAttrs[a];
	        if (nextVal === undefined || nextVal === null || nextVal === false) {
	            switch (a) {
	                case ON:
	                case KEY:
	                    break;
	                case CHECKED:
	                case DISABLED:
	                case SELECTED:
	                    D[a] = false;
	                    break;
	                case VALUE:
	                    D['value'] = EMPTYSTRING;
	                    break;
	                case FOCUS:
	                    D['blur']();
	                    break;
	                default:
	                    D['removeAttribute'](a);
	                    break;
	            }
	        }
	    }
	    for (a in nextAttrs) {
	        currentVal = currentAttrs[a];
	        nextVal = nextAttrs[a];
	        if (!(nextVal === undefined || nextVal === null || nextVal === false) &&
	            nextVal !== currentVal &&
	            typeof nextVal !== FUNCTION) {
	            switch (a) {
	                case ON:
	                case KEY:
	                    break;
	                case CHECKED:
	                case DISABLED:
	                case SELECTED:
	                case VALUE:
	                    D[a] = nextVal;
	                    break;
	                case FOCUS:
	                    D['focus']();
	                    break;
	                default:
	                    D['setAttribute'](a, nextVal);
	                    break;
	            }
	        }
	    }
	    // update event listeners
	    if (currentEvts && !nextEvts) {
	        for (evt in currentEvts) {
	            D.removeEventListener(evt, currentEvts[evt]);
	        }
	    }
	    else if (!currentEvts && nextEvts) {
	        for (evt in nextEvts) {
	            D.addEventListener(evt, nextEvts[evt]);
	        }
	    }
	    else if (currentEvts && nextEvts) {
	        for (evt in currentEvts) {
	            if (!nextEvts[evt]) {
	                D.removeEventListener(evt, currentEvts[evt]);
	            }
	        }
	        for (evt in nextEvts) {
	            if (currentEvts[evt] !== nextEvts[evt]) {
	                if (currentEvts[evt]) {
	                    D.removeEventListener(evt, currentEvts[evt]);
	                }
	                D.addEventListener(evt, nextEvts[evt]);
	            }
	        }
	    }
	    return D;
	}
	function shouldExploreFurther(current, next, currentType, nextType) {
	    return currentType === nextType &&
	        (currentType === VNODE || currentType === VCHILD) &&
	        current[0] === next[0];
	}
	function vDomToHtmlString(vDom) {
	    switch (getType(vDom)) {
	        case VCHILD:
	            vDom[2] = vDom[0](vDom[1]);
	            return vNodeToHtmlString(vDom[2]);
	        case VNODE:
	            return vNodeToHtmlString(vDom);
	        case VATOM:
	            return '<span>' + vDom + '</span>';
	        default:
	            return '';
	    }
	}
	exports.vDomToHtmlString = vDomToHtmlString;
	function vNodeToHtmlString(vDom) {
	    var tag = vDom[0];
	    var attrs = vDom[1];
	    var children;
	    var val;
	    var a;
	    var attrPairs = [];
	    var c;
	    var res;
	    vDom[2] = vDom[2] ? vDom[2].filter(isDefined) : []; // !! mutates vDom !!
	    children = vDom[2];
	    if (attrs) {
	        for (a in attrs) {
	            val = attrs[a];
	            if (!(val === undefined || val === null || val === false) && a !== KEY && a !== ON) {
	                attrPairs.push(a + '="' + val + '"');
	            }
	        }
	    }
	    res = '<' + [tag].concat(attrPairs).join(' ') + '>';
	    if (!VOID_ELEMENTS[tag]) {
	        for (c = 0; c < children.length; c++) {
	            if (!(c === undefined || c === null || c === false)) {
	                res += vDomToHtmlString(children[c]);
	            }
	        }
	        res += '</' + tag + '>';
	    }
	    return res;
	}
	exports.vNodeToHtmlString = vNodeToHtmlString;
	function vDomToDom(vDom) {
	    switch (getType(vDom)) {
	        case VATOM:
	        case VNODE:
	        case VCHILD:
	            if (vDom['length'] === 0)
	                return undefined;
	            var el = document.createElement('div');
	            el.innerHTML = vDomToHtmlString(vDom);
	            var dom = el.firstChild;
	            bindEvents(vDom, dom);
	            return dom;
	        case VNULL:
	            return undefined;
	    }
	}
	exports.vDomToDom = vDomToDom;
	function bindEvents(vDom, D) {
	    var vType = getType(vDom);
	    var vNode;
	    var vAttrs;
	    var evts;
	    var evt;
	    var child;
	    var children;
	    if (vType === VATOM || vType === VNULL) {
	        return;
	    }
	    vNode = vType === VCHILD ? vDom[2] : vDom;
	    vAttrs = vNode[1];
	    children = vNode[2];
	    if (vAttrs) {
	        evts = vAttrs[ON];
	        if (evts) {
	            for (evt in evts) {
	                D.addEventListener(evt, evts[evt]);
	            }
	        }
	    }
	    if (children) {
	        for (child = 0; child < children.length; child++) {
	            bindEvents(children[child], D.childNodes[child]);
	        }
	    }
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.REMOVE = exports.MOVE = exports.UPDATE = exports.CREATE = undefined;

	var _bitVector = __webpack_require__(3);

	/**
	 * Actions
	 */

	var CREATE = 0; /**
	                 * Imports
	                 */

	var UPDATE = 1;
	var MOVE = 2;
	var REMOVE = 3;

	/**
	 * dift
	 */

	function dift(prev, next, effect, key) {
	  var pStartIdx = 0;
	  var nStartIdx = 0;
	  var pEndIdx = prev.length - 1;
	  var nEndIdx = next.length - 1;
	  var pStartItem = prev[pStartIdx];
	  var nStartItem = next[nStartIdx];

	  // List head is the same
	  while (pStartIdx <= pEndIdx && nStartIdx <= nEndIdx && equal(pStartItem, nStartItem)) {
	    effect(UPDATE, pStartItem, nStartItem, nStartIdx);
	    pStartItem = prev[++pStartIdx];
	    nStartItem = next[++nStartIdx];
	  }

	  // The above case is orders of magnitude more common than the others, so fast-path it
	  if (nStartIdx > nEndIdx && pStartIdx > pEndIdx) {
	    return;
	  }

	  var pEndItem = prev[pEndIdx];
	  var nEndItem = next[nEndIdx];
	  var movedFromFront = 0;

	  // Reversed
	  while (pStartIdx <= pEndIdx && nStartIdx <= nEndIdx && equal(pStartItem, nEndItem)) {
	    effect(MOVE, pStartItem, nEndItem, pEndIdx - movedFromFront + 1);
	    pStartItem = prev[++pStartIdx];
	    nEndItem = next[--nEndIdx];
	    ++movedFromFront;
	  }

	  // Reversed the other way (in case of e.g. reverse and append)
	  while (pEndIdx >= pStartIdx && nStartIdx <= nEndIdx && equal(nStartItem, pEndItem)) {
	    effect(MOVE, pEndItem, nStartItem, nStartIdx);
	    pEndItem = prev[--pEndIdx];
	    nStartItem = next[++nStartIdx];
	    --movedFromFront;
	  }

	  // List tail is the same
	  while (pEndIdx >= pStartIdx && nEndIdx >= nStartIdx && equal(pEndItem, nEndItem)) {
	    effect(UPDATE, pEndItem, nEndItem, nEndIdx);
	    pEndItem = prev[--pEndIdx];
	    nEndItem = next[--nEndIdx];
	  }

	  if (pStartIdx > pEndIdx) {
	    while (nStartIdx <= nEndIdx) {
	      effect(CREATE, null, nStartItem, nStartIdx);
	      nStartItem = next[++nStartIdx];
	    }

	    return;
	  }

	  if (nStartIdx > nEndIdx) {
	    while (pStartIdx <= pEndIdx) {
	      effect(REMOVE, pStartItem);
	      pStartItem = prev[++pStartIdx];
	    }

	    return;
	  }

	  var created = 0;
	  var pivotDest = null;
	  var pivotIdx = pStartIdx - movedFromFront;
	  var keepBase = pStartIdx;
	  var keep = (0, _bitVector.createBv)(pEndIdx - pStartIdx);

	  var prevMap = keyMap(prev, pStartIdx, pEndIdx + 1, key);

	  for (; nStartIdx <= nEndIdx; nStartItem = next[++nStartIdx]) {
	    var oldIdx = prevMap[key(nStartItem)];

	    if (isUndefined(oldIdx)) {
	      effect(CREATE, null, nStartItem, pivotIdx++);
	      ++created;
	    } else if (pStartIdx !== oldIdx) {
	      (0, _bitVector.setBit)(keep, oldIdx - keepBase);
	      effect(MOVE, prev[oldIdx], nStartItem, pivotIdx++);
	    } else {
	      pivotDest = nStartIdx;
	    }
	  }

	  if (pivotDest !== null) {
	    (0, _bitVector.setBit)(keep, 0);
	    effect(MOVE, prev[pStartIdx], next[pivotDest], pivotDest);
	  }

	  // If there are no creations, then you have to
	  // remove exactly max(prevLen - nextLen, 0) elements in this
	  // diff. You have to remove one more for each element
	  // that was created. This means once we have
	  // removed that many, we can stop.
	  var necessaryRemovals = prev.length - next.length + created;
	  for (var removals = 0; removals < necessaryRemovals; pStartItem = prev[++pStartIdx]) {
	    if (!(0, _bitVector.getBit)(keep, pStartIdx - keepBase)) {
	      effect(REMOVE, pStartItem);
	      ++removals;
	    }
	  }

	  function equal(a, b) {
	    return key(a) === key(b);
	  }
	}

	function isUndefined(val) {
	  return typeof val === 'undefined';
	}

	function keyMap(items, start, end, key) {
	  var map = {};

	  for (var i = start; i < end; ++i) {
	    map[key(items[i])] = i;
	  }

	  return map;
	}

	/**
	 * Exports
	 */

	exports.default = dift;
	exports.CREATE = CREATE;
	exports.UPDATE = UPDATE;
	exports.MOVE = MOVE;
	exports.REMOVE = REMOVE;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Use typed arrays if we can
	 */

	var FastArray = typeof Uint32Array === 'undefined' ? Array : Uint32Array;

	/**
	 * Bit vector
	 */

	function createBv(sizeInBits) {
	  return new FastArray(Math.ceil(sizeInBits / 32));
	}

	function setBit(v, idx) {
	  var r = idx % 32;
	  var pos = (idx - r) / 32;

	  v[pos] |= 1 << r;
	}

	function clearBit(v, idx) {
	  var r = idx % 32;
	  var pos = (idx - r) / 32;

	  v[pos] &= ~(1 << r);
	}

	function getBit(v, idx) {
	  var r = idx % 32;
	  var pos = (idx - r) / 32;

	  return !!(v[pos] & 1 << r);
	}

	/**
	 * Exports
	 */

	exports.createBv = createBv;
	exports.setBit = setBit;
	exports.clearBit = clearBit;
	exports.getBit = getBit;

/***/ }
/******/ ]);