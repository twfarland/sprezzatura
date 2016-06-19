// Js types
var UNDEFINED = 'undefined'
var STRING = 'string'
var NUMBER = 'number'
var FUNCTION = 'function'
var OBJECT = '[object Object]'

// Props
var KEY = 'key'
var VALUE = 'value'
var CHECKED = 'checked'
var SELECTED = 'selected'
var FOCUS = 'focus'
var ON = 'on'

// Html
var FIELD_ELEMENTS = { input:1, select:1, textarea:1 }
var VOID_ELEMENTS = { area:1, base:1, br:1, col:1, command:1, embed:1, hr:1, img:1, input:1, keygen:1, link:1, meta:1, param:1, source:1, track:1, wbr:1 };

// vDomType
var VATOM = 0
var VNODE = 1
var VCHILD = 2
var VRENDERED = 3
var VNULL = 4

/*
vAtom :: 
    String
    Number

vNode :: 
    [String] 
    [String, { attrs }] 
    [String, { attrs }, [vDom ...]] 

vChild ::
    [Function, { params } ...]

vRendered ::
    [true, vChild, vDom]    

vDom :: 
    vAtom
    vNode
    vChild
    vRendered
    vNull
*/


/// ---------- UTILS ----------

var slice = Array.prototype.slice
var toString = Object.prototype.toString


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


// vDom -> vDomType
function getType (vDom) {
    if (vDom instanceof Array) {
        if (typeof vDom[0] === FUNCTION) {
            return VCHILD

        } else if (vDom[0] === true) {
            return VRENDERED

        } else {    
            return VNODE
        }
    } else if (typeof vDom === STRING || typeof vDom === NUMBER) {
        return VATOM

    } else {
        return VNULL
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


// vChild -> _
// Mutates A into vRendered
function renderChild (vChild) {
    var vDom = vChild[0].apply(null, vChild.slice(1))
    var vChildClone = vChild.slice()
    vChild.length = 0
    vChild.push(true)
    vChild.push(vChildClone)
    vChild.push(vDom)
}


// vRendered -> vChild -> _
// mutates B, so it has same contents as A
function transferRendered (A, B) {
    B.length = 0
    for (var i = 0; i < A.length; i++) {
        B.push(A[i])
    }
}


// Node -> VDom -> VDom -> _
// A and B should only ever be the same Tag or Child (rendered or unrendered)
function updateDom (D, A, B) {

    switch (getType(A)) {

        case VCHILD:

            renderChild(A) // mutates A
            updateDom(D, A, B)

            break

        case VRENDERED:

            var vChildA = A[1]
            var vDomA   = A[2]
            var fA      = vChildA[0]

            if (!fA.shouldUpdate || fA.shouldUpdate(vChildA.slice(1), vChildB.slice(1))) {

                transferRendered(A, B) // transfer A to B, so it becomes rendered without execution

            } else {
                renderChild(B) // mutates B
                updateDom(D, vDomA, B[2])
            }

            break
                

        case VNODE:

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
        i,
        aType, bType

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

            aType = getType(a)
            bType = getType(b)
        	
            if (aType === bType && (aType === VNODE || aType === VCHILD) ||
               (aType === VRENDERED && bType === VCHILD && a[1][0] === b[0])) {
	                
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

    switch (getType(vDom)) {

        case VCHILD:
            renderChild(vDom)
            return vNodeToHtmlString(vDom[2])

        case VRENDERED:
            return vNodeToHtmlString(vDom[2])

        case VNODE:
            return vNodeToHtmlString(vDom)

        case VATOM:
            return v

        default:
            return ''
}


// vNode -> HtmlString
function vNodeToHtmlString (v) {

    var tag = v[0]
    var attrs = v[1]
    var children = v[2]
    var a
    var attrPairs = []
    var c
    var res

    for (a in attrs) {
        if (truthy(attrs[a]) && a !== KEY && a !== ON) { 
            attrPairs.push(a + '="' + attrs[a] + '"') 
        }
    }

    res = '<' + [tag].concat(attrPairs).join(' ') + '>'

    if (!VOID_ELEMENTS[tag]) {
        for (c = 0; c < children.length; c++) { 
            if (truthy(children[c])) {
                res += vDomToHtmlString(children[c]) 
            }
        }
        res += '</' + tag + '>'
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

        switch (getType(vDom)) {

            case VCHILD:
                renderChild(vDom)
                v = vDom[2]
                break

            case VRENDERED:
                v = vDom[2]
                break
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


