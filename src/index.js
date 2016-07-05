var dift = require('dift')


// Js types
var STRING          = 'string'
var NUMBER          = 'number'
var FUNCTION        = 'function'

// Props
var KEY             = 'key'
var VALUE           = 'value'
var CHECKED         = 'checked'
var SELECTED        = 'selected'
var DISABLED        = 'disabled'
var FOCUS           = 'focus'
var ON              = 'on'
var EMPTYSTRING     = ''

// Html
var VOID_ELEMENTS = { area:1, base:1, br:1, col:1, command:1, embed:1, hr:1, img:1, input:1, keygen:1, link:1, meta:1, param:1, source:1, track:1, wbr:1 }

// vDomType
var VATOM   = 0
var VNODE   = 1
var VCHILD  = 2
var VNULL   = 3


/*
vAtom :: 
    String
    Number

vNode :: 
    [String] 
    [String, { attrs }] 
    [String, { attrs }, [vDom ...]] 

vChild ::
    [Function, { params }, vNode?]

vDom :: 
    vAtom
    vNode
    vChild
    vNull
*/


// vDom -> vDomType
function getType (vDom) {

    if (vDom instanceof Array) {
        return typeof vDom[0] === FUNCTION ? VCHILD : VNODE

    } else if (typeof vDom === STRING || typeof vDom === NUMBER) {
        return VATOM

    } else {
        return VNULL
    }
}


// vDom -> int -> key
function keyOf (v, i) {
    return (v instanceof Array && v[1] && v[1].key) || i
}


// [vDom] -> [{ key: *, vDom: vDom, pos: i }]
function groupChildren (vDoms, DChildren) {
    var res = []
    var v
    var i
    for (i = 0; i < vDoms.length; i++) {
        v = vDoms[i]
        if (!(v === false || v === undefined || v === null)) {
            res.push({ key: keyOf(v, i), vDom: v, element: DChildren && DChildren[i] })
        }
    }
    return res
}


// vDom -> key
function getKey (v) { 
    return v.key 
}


// [vDom] -> [vDom] -> domNode -> domNode
function updateChildren (currentChildren, nextChildren, D) {

    dift.default(

        groupChildren(currentChildren, D.childNodes),
        groupChildren(nextChildren),

        function effect (type, current, next, pos) {

            var newNode

            switch (type){
                case dift.CREATE: // null, new, posToCreate
                    newNode = vDomToDom(next.vDom)
                    if (newNode) D.insertBefore(newNode, D.childNodes[pos] || null)
                    break

                case dift.UPDATE: // old, new, null
                    updateDom(current.vDom, next.vDom, current.element, D)
                    break

                case dift.MOVE: // old, new, newPos
                    D.insertBefore(
                        updateDom(current.vDom, next.vDom, current.element, D), 
                        current.element
                    )
                    break

                case dift.REMOVE: // null, old, null
                    D.removeChild(current.element)
                    break
            }
        },

        getKey
    )

    return D
}


// vDom -> vDom -> domNode -> domNode -> domNode
function updateDom (current, next, D, DParent) {

    if (D === undefined) { throw new Error('No dom node to update') }

    if (current === next) { return }
    
    var currentExists = current !== undefined
    var nextExists    = next !== undefined
    var newNode

    if (!currentExists && nextExists) {
        newNode = vDomToDom(next)
        if (newNode) { DParent.appendChild(newNode) }

    } else if (currentExists && !nextExists) {
        DParent.removeChild(D)

    } else if (currentExists && nextExists) {

        var currentType   = getType(current)
        var nextType      = getType(next)

        if (shouldExploreFurther(current, next, currentType, nextType)) {

            switch (nextType) {

                case VNODE:
                    updateAttributes(current[1] || {}, next[1] || {}, D)
                    updateChildren(current[2] || [], next[2] || [], D)
                    break

                case VCHILD:
                    if (next[0].shouldUpdate ? 
                        next[0].shouldUpdate(current[1], next[1]) : 
                        next[1] && current[1] && next[1] !== current[1]) {

                        next[2] = next[0](next[1])
                        updateAttributes(current[2][1] || {}, next[2][1] || {}, D)
                        updateChildren(current[2][2] || [], next[2][2] || [], D)

                    } else {
                        next[2] = current[2]
                    }
                    break
            }

        } else if (current !== next) {
            newNode = vDomToDom(next)
            if (newNode) { 
                DParent.replaceChild(newNode, D)
                console.log(DParent.innerHTML, newNode, D) 
            }
        }
    }

    return D
}


// vDom -> vDom -> domNode -> domNode
function updateAttributes (currentAttrs, nextAttrs, D) {

    var a
    var currentVal
    var nextVal
    var evt
    var currentEvts = currentAttrs[ON]
    var nextEvts    = nextAttrs[ON]

    for (a in currentAttrs) { // remove all those not in B from A

        currentVal = currentAttrs[a]
        nextVal = nextAttrs[a]

        if (nextVal === undefined || nextVal === null || nextVal === false) {

            switch (a) {
                case ON:
                case KEY:
                    break
                case CHECKED:
                case DISABLED:
                case SELECTED:
                    D[a] = false
                    break
                case VALUE:
                    D.value = EMPTYSTRING
                    break
                case FOCUS:
                    D.blur()
                    break
                default:
                    D.removeAttribute(a)
                    break    
            }
        }
    } 

    for (a in nextAttrs) { // set all those in B to A

        currentVal = currentAttrs[a]
        nextVal = nextAttrs[a]

        if (!(nextVal === undefined || nextVal === null || nextVal === false) && 
            nextVal !== currentVal &&
            typeof nextVal !== FUNCTION) {

            switch (a) {
                case ON:
                case KEY:
                    break  
                case CHECKED:
                case DISABLED:
                case SELECTED:
                case VALUE:
                    D[a] = nextVal
                    break 
                case FOCUS:
                    D.focus()
                    break
                default:
                    D.setAttribute(a, nextVal)
                    break
            }
        }
    }

    // update event listeners
    if (currentEvts && !nextEvts) {
        for (evt in currentEvts) {
             D.removeEventListener(evt, currentEvts[evt])
        }

    } else if (!currentEvts && nextEvts) {
        for (evt in nextEvts) {
             D.addEventListener(evt, nextEvts[evt])
        }

    } else if (currentEvts && nextEvts) {
        for (evt in currentEvts) {
            if (!nextEvts[evt]) { 
                D.removeEventListener(evt, currentEvts[evt]) 
            }
        }
        for (evt in nextEvts) {
            if (currentEvts[evt] !== nextEvts[evt]) {
                if (currentEvts[evt]) {
                    D.removeEventListener(evt, currentEvts[evt]) 
                }
                D.addEventListener(evt, nextEvts[evt]) 
            }
        }
    }

    return D
}


// vDom -> vDom -> vType -> vType -> bool
function shouldExploreFurther (current, next, currentType, nextType) {
    return currentType === nextType &&
            (currentType === VNODE || currentType === VCHILD) &&
            current[0] === next[0]
}


// vDom -> HtmlString
function vDomToHtmlString (vDom) {

    switch (getType(vDom)) {

        case VCHILD:
            vDom[2] = vDom[0](vDom[1])
            return vNodeToHtmlString(vDom[2])

        case VNODE:
            return vNodeToHtmlString(vDom)

        case VATOM:
            return String(vDom)

        default:
            return ''
    }
}


// vDom -> HtmlString
function vNodeToHtmlString (vDom) {

    var tag = vDom[0]
    var attrs = vDom[1]
    var children = vDom[2] || []
    var val
    var a
    var attrPairs = []
    var c
    var res

    if (attrs) {
        for (a in attrs) {
            val = attrs[a]
            if (!(val === undefined || val === null || val === false) && a !== KEY && a !== ON) { 
                attrPairs.push(a + '="' + val + '"') 
            }
        }
    }

    res = '<' + [tag].concat(attrPairs).join(' ') + '>'

    if (!VOID_ELEMENTS[tag]) {
        for (c = 0; c < children.length; c++) { 
            if (!(c === undefined || c === null || c === false)) {
                res += vDomToHtmlString(children[c]) 
            }
        }
        res += '</' + tag + '>'
    }

    return res
}


// vDom -> domNode || undefined
function vDomToDom (vDom) {

    switch (getType(vDom)) {

        case VATOM:
            return document.createTextNode(vDom)

        case VNODE:
        case VCHILD: // child rendering is handled by vDomToHtmlString

            if (vDom.length === 0) return undefined

            var el = document.createElement('div')
            el.innerHTML = vDomToHtmlString(vDom)
            var dom = el.firstChild
            bindEvents(vDom, dom)
            return dom

        case VNULL:
            return undefined
    }
}



// vDom -> domNode -> _
function bindEvents (vDom, D) {

    var vType = getType(vDom)
    var vNode
    var vAttrs
    var evts
    var evt
    var child
    var children

    if (vType === VATOM || vType === VNULL) { return }

    vNode    = vType === VCHILD ? vDom[2] : vDom
    vAttrs   = vNode[1]
    children = vNode[2]

    if (vAttrs) {
        evts = vAttrs[ON]
        if (evts) {
            for (evt in evts) {
                 D.addEventListener(evt, evts[evt])
            }
        }
    }

    if (children) {
        for (child = 0; child < children.length; child++) {
            bindEvents(children[child], D.childNodes[child])
        }
    }
}



module.exports = {
    vDomToHtmlString: vDomToHtmlString,
    vDomToDom: vDomToDom,
    updateDom: updateDom
}
