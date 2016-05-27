var UNDEFINED = 'undefined'
var STRING = 'string'
var FUNCTION = 'function'
var KEY = 'key'
var VALUE = 'value'
var CHECKED = 'checked'
var SELECTED = 'selected'
var FOCUS = 'focus'
var ON = 'on'

var FIELD_ELEMENTS = { input:1, select:1, textarea:1 }
var VOID_ELEMENTS = { area:1, base:1, br:1, col:1, command:1, embed:1, hr:1, img:1, input:1, keygen:1, link:1, meta:1, param:1, source:1, track:1, wbr:1 };


/*
vDom :: [String] 
      | [String, {}] 
      | [String, {}, []] 
      | [Function, {}] 
      | Atom
*/



/// ---------- UTILS ----------

var slice = Array.prototype.slice;

try {
    slice.call(document.body.childNodes)

} catch (e) {
    slice = function () {
        var res = [], i
        for (i = 0; i < this.length; i++) { 
        	res.push(this[i]) 
        }
        return res  
    }
}


// A -> Bool
function truthy (n) {
	if (n instanceof Array || typeof n === STRING) return n.length > 0
    return !!(n === 0 || n)
}


// VDom -> Bool
function vDomIsKeyed (vDom) {
	return vDom[2] && vDom[2][0] && vDom[2][0][1] && typeof vDom[2][0][1].key !== 'undefined'
}


// Node -> Int -> Node -> _
// inserts the child in the parent at index
function insertBeforeIndex (parent, i, child) { 

    var next = parent.childNodes[i]

    if (next) {
        parent.insertBefore(child, next)
    } else {
        parent.appendChild(child)
    }
}



// --------- UPDATE ----------



// Node -> VDom -> VDom -> _
// A and B should only ever be the same Tag or Function
function updateDom (D, A, B) {

    switch (typeof A[0]) {

        case FUNCTION:

            if (!A[0].shouldUpdate || A[0].shouldUpdate(A[1], B[1])) {

                if (!A[2]) { A[2] = A[0](A[1] || {}) }
                if (!B[2]) { B[2] = B[0](B[1] || {}) }

                updateDom(D, A[2], B[2])  
            }
            break

        case STRING:

            if (A[1] || B[1]) {
                (FIELD_ELEMENTS[D.tagName.toLowerCase()] ? 
                    updateFieldAttributes : 
                    updateAttributes)(D, A[1] || {}, B[1] || {})

                updateEvents(D, (A[1] || {})[ON], (B[1] || {})[ON])
            }

            if (A[2] || B[2]) {
                (vDomIsKeyed(B) ? 
                    updateChildrenKeyed : 
                    updateChildrenPairwise)(D, slice.call(D.childNodes), A[2] || [], B[2] || [])
            }

            break

        default:
            return
    }
}


// Node -> { EventName: Handler } -> { EventName: Handler } -> _
// just clear all events on the node and add the new ones
// perhaps a bit rough, but let's see for now
// in practice there should be only one or a couple handlers on a node
function updateEvents (D, AEvts, BEvts) {

    var evt

    if (AEvts) {
        for (evt in AEvts) {
            D.removeEventListener(evt, AEvts[evt])
        }
    }

    if (BEvts) {
        for (evt in BEvts) {
            D.addEventListener(evt, BEvts[evt])
        }
    }
}



// Node -> Attrs -> Attrs -> _
// Update the attributes from the new VDom (b) in the old Dom (b) by comparing 
// with attributes of the current VDom (a).
// If it's in a but not in b, it should be removed from d.
// If it's in b, it should be set in d.
function updateAttributes (D, AAttrs, BAttrs) {

	var AAttr, BAttr

    for (AAttr in AAttrs) {
        if (AAttr !== KEY && AAttr !== ON && !truthy(BAttrs[AAttr])) {
        	D.removeAttribute(BAttrs[AAttr])
        }
    } 

    for (BAttr in BAttrs) {
    	if (AAttr !==  KEY && AAttr !== ON && truthy(BAttrs[BAttr])) { 
    		D.setAttribute(BAttr, BAttrs[AAttr])
    	}
    }
}



// Node -> Attrs -> Attrs -> _
// A more involved attribute updater that can deal with form fields
function updateFieldAttributes (D, AAttrs, BAttrs) {

    var AAttr, BAttr, BVal

    for (AAttr in AAttrs) {

    	BVal = BAttrs[AAttr]

        if (!truthy(BVal)) {

        	switch (AAttr) {
                case KEY:
                case ON:
                    break
        		case VALUE:
        			D.value = ''
                    break
        		case CHECKED:
        			D.checked = false
                    break
        		case SELECTED:
        			D.selected = false
                    break
        		case FOCUS:
        			D.blur()
                    break
        		default:
        			D.removeAttribute(AAttr)
                    break    
        	}
        }
    } 

    for (BAttr in BAttrs) { // set all those in B to A

    	BVal = BAttrs[BAttr]

    	if (truthy(BVal)) {

	    	switch (BAttr) {
                case KEY:
                case ON:
                    break
	    		case VALUE:
	    			D.value = BVal
                    break    
	    		case CHECKED:
	    			D.checked = !!BVal
                    break
	    		case SELECTED:
	    			D.selected = !!BVal
                    break
	    		case FOCUS:
	    			D.focus()
                    break
	    		default:
	    			D.setAttribute(BAttr, BVal)
                    break
	    	}
	    }
    }
}




// Node -> [Node] -> [VDom] -> [VDom] -> _
// Updates the children in the Dom with a naive strategy
// This is the default strategy
function updateChildrenPairwise (D, DChildren, AChildren, BChildren) {

    var d, a, b,
        existsD, existsA, existsB,
        i

    for (i = 0; i < Math.max(AChildren.length, BChildren.length); i++) {

        d = DChildren[i]
        a = AChildren[i]
        b = BChildren[i]
        existsD = typeof d !== UNDEFINED
        existsA = typeof a !== UNDEFINED
        existsB = typeof b !== UNDEFINED
        
        if (!existsD && !existsA && existsB) { // no d/a, but b
            D.appendChild(vDomToDom(b))

        } else if (existsD && existsA && !existsB) { // d/a, but no b
            D.removeChild(d)

        } else if (existsD && existsA && existsB) { // both
        	
            if ((a instanceof Array) &&
                (a[0] === b[0]) &&
            	(typeof a[0] === STRING || typeof a[0] === FUNCTION)) { 
	                
	            updateDom(d, a, b) // same tag or function, explore

            } else if (a !== b) {
                D.replaceChild(vDomToDom(b), d) // throwaway and regen
            }
        }
    }
}


// VDom -> [Node] -> [VDom] -> [VDom] -> _
// Updates the children in the Dom with a hash-based, keyed strategy
// This is used if the children have unique _key properties
// The _key properties must faithfully represent the entire state of the 
// child and all its attributes/children
function updateChildrenKeyed (D, DChildren, AChildren, BChildren) {

    var d, a, b, i
    var AKeys = {} // { id: Node }
    var AKey
    var BKeys = {} // { id: vDom }
    var BKey
    var ANode

    for (i = 0; i < Math.max(AChildren.length, BChildren.length); i++) {

        d = DChildren[i]
        a = AChildren[i]
        b = BChildren[i]

        if (truthy(a)) AKeys[a[1][KEY]] = { dom: d, vDom: a }
        if (truthy(b)) BKeys[b[1][KEY]] = b
    }

    for (AKey in AKeys) {
        if (BKeys[AKey] === undefined) {
            D.removeChild(AKeys[AKey].dom)
        }
    } 

    for (i = 0; i < BChildren.length; i++) {

        b = BChildren[i]
        ANode = AKeys[b[1][KEY]]

        if (ANode === undefined) {
            insertBeforeIndex(D, i, vDomToDom(b))

        } else {
            updateDom(ANode.dom, ANode.vDom, b) // assume they're the same type if they have the same id
        }
    }
}




// ---------- Virtual dom / dom / string transformers


// HtmlString -> Node
function htmlStringToDom (str) {
    var el = document.createElement('div')
    el.innerHTML = str
    return el.firstChild
}



// vDom -> HtmlString
function vDomToHtmlString (vDom) {

	var v = vDom

    if (vDom instanceof Array) {

    	if (typeof vDom[0] === FUNCTION) {
    		v = vDom[0](vDom[1])
            if (!vDom[2]) { vDom[2] = v }
    	}

        var tag = v[0],
            attrs = v[1],
            children = v[2],
        	a,
        	attrPairs = [],
        	c,
    		res

        for (a in attrs) {
            if (truthy(attrs[a]) && a !== KEY && a !== ON) { 
            	attrPairs.push(a + '="' + attrs[a] + '"') 
            }
        }

        res = '<' + [tag].concat(attrPairs).join(' ') + '>'

        if (!VOID_ELEMENTS[tag]) {
            for (c = 0; c < children.length; c++) { 
            	res += vDomToHtmlString(children[c]) 
            }
            res += '</' + tag + '>'
        }

        return res

    } else if (typeof v === STRING) { // atom
        return v

    } else if (v !== false && v !== null && typeof v !== UNDEFINED && v.toString) {
        return v.toString()

    } else {
        return ''
    }
}

// vDom -> Node
function vDomToDom (vDom) {
    const dom = htmlStringToDom(vDomToHtmlString(vDom))
    bindInitialEvents(dom, vDom)
    return dom
}


function bindEvents (D, evts) {
    for (var evt in evts) {
        D.addEventListener(evt, evts[evt])
    }
}


function bindInitialEvents (D, vDom) {

    var v = vDom
    var dChildren
    var i

    if (vDom instanceof Array && D) {

        dChildren = slice.call(D.childNodes)

        if (typeof vDom[0] === FUNCTION) { 
            v = vDom[2] // already generated
        }

        if (v[1] && v[1].on) {
            bindEvents(D, v[1].on) 
        }

        if (v[2]) { 
            for (i = 0; i < v[2].length; i++) {
                bindInitialEvents(dChildren[i], v[2][i])
            }
        }
    }
}




module.exports = {
    vDomToDom: vDomToDom,
    updateDom: updateDom
}


