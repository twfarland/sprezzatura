
import dift, { CREATE, UPDATE, MOVE, REMOVE } from 'dift'

const STRING          = 'string'
const NUMBER          = 'number'
const FUNCTION        = 'function'

const KEY             = 'key'
const VALUE           = 'value'
const CHECKED         = 'checked'
const SELECTED        = 'selected'
const DISABLED        = 'disabled'
const FOCUS           = 'focus'
const ON              = 'on'
const HOOKS           = 'hooks'
const EMPTYSTRING     = ''

const VOID_ELEMENTS = { area:1, base:1, br:1, col:1, command:1, embed:1, hr:1, img:1, input:1, keygen:1, link:1, meta:1, param:1, source:1, track:1, wbr:1 }

const VATOM  = 0
const VNODE  = 1
const VCHILD = 2 
const VNULL  = 3

export type VDomType = number
export type Key = string | number
export type VAtom = string | number | boolean | void | null


export interface VDomView {
    (props: any): VDom
}

export interface DomPosn {
    key:        Key
    vDom?:      VDom
    pos:        number
    element?:   Node
}

export type VNodeSingle = [string] // Possible improvement - encode valid tag strings as a union type?
export type VNodeAttrs  = [string, any] // actually an object with any key/vals 
export type VNodeChild  = [string, any, any[]] // actually VDom[], but ts can't do recursive type defs yet 

export type VNode = 
    VNodeSingle 
    | VNodeAttrs 
    | VNodeChild 

export type VChild =
    [VDomView, any]

export type VDom =
    VAtom
    | VNode 
    | VChild

function getType (vDom: VDom): VDomType {

    if (vDom instanceof Array) {
        return typeof vDom[0] === FUNCTION ? VCHILD : VNODE

    } else if (typeof vDom === STRING || typeof vDom === NUMBER) {
        return VATOM

    } else {
        return VNULL
    }
}

function keyOf (v: VDom, i: number): Key {
    return (v instanceof Array && v[1] && v[1].key) || i
}

function groupChildren (vDoms: VDom[], DChildren?: NodeList): DomPosn[] {
    var res = []
    var v
    var i
    for (i = 0; i < vDoms.length; i++) {
        v = vDoms[i]
        res.push({ key: keyOf(v, i), vDom: v, element: DChildren && DChildren[i] })
    }
    return res
}

function getKey (v: DomPosn): Key { 
    return v.key 
}

function isDefined (v: VDom): boolean {
    return !(v === false || v === undefined || v === null)
}

function updateChildren (current: VDom, next: VDom, D: Node): Node {

    next[2] = next[2] ? next[2].filter(isDefined) : [] // !! mutates vDom !!

    dift(

        groupChildren(current[2] || [], D.childNodes),
        groupChildren(next[2]),

        function effect (type, current, next, pos) {

            var newNode

            switch (type) {
                case CREATE: // null, new, posToCreate
                    newNode = vDomToDom(next.vDom)
                    if (newNode) D.insertBefore(newNode, D.childNodes[pos] || null)
                    break

                case UPDATE: // old, new, null
                    updateDom(current.vDom, next.vDom, current.element, D)
                    break

                case MOVE: // old, new, newPos
                    D.insertBefore(
                        updateDom(current.vDom, next.vDom, current.element, D), 
                        current.element
                    )
                    break

                case REMOVE: // null, old, null
                    D.removeChild(current.element)
                    break
            }
        },

        getKey
    )

    return D
}

export function updateDom (current: VDom, next: VDom, D: Node, DParent: Node): Node {

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
                    updateChildren(current, next, D)
                    break

                case VCHILD:
                    const hooks = next[1] && next[1][HOOKS]
                    
                    if (hooks && hooks.shouldUpdate ? 
                        hooks.shouldUpdate(current[1], next[1]) : 
                        next[1] && current[1] && next[1] !== current[1]) {

                        next[2] = next[0](next[1])
                        updateAttributes(current[2][1] || {}, next[2][1] || {}, D)
                        updateChildren(current[2], next[2], D)

                    } else {
                        next[2] = current[2]
                    }
                    break
            }

        } else if (current !== next) {
            newNode = vDomToDom(next)
            if (newNode) { 
                DParent.replaceChild(newNode, D)
            }
        }
    }

    return D
}

function updateAttributes (currentAttrs: any, nextAttrs: any, D: Node): Node {

    var a
    var currentVal
    var nextVal
    var evt
    var currentEvts = currentAttrs[ON]
    var nextEvts    = nextAttrs[ON]

    for (a in currentAttrs) { // remove all those not in B from A

        currentVal = currentAttrs[a]
        nextVal = nextAttrs[a]

        if (nextVal === undefined || nextVal === null || nextVal === false || nextVal === EMPTYSTRING) {

            switch (a) {
                case ON:
                case HOOKS:
                case KEY:
                    break
                case CHECKED:
                case DISABLED:
                case SELECTED:
                    D[a] = false
                    break
                case VALUE:
                    D['value'] = EMPTYSTRING
                    break
                case FOCUS:
                    D['blur']()
                    break
                default:
                    D['removeAttribute'](a)
                    break    
            }
        }
    } 

    for (a in nextAttrs) { // set all those in B to A

        currentVal = currentAttrs[a]
        nextVal = nextAttrs[a]

        if (!(nextVal === undefined || nextVal === null || nextVal === false || nextVal === EMPTYSTRING) && 
            nextVal !== currentVal &&
            typeof nextVal !== FUNCTION) {

            switch (a) {
                case ON:
                case HOOKS:
                case KEY:
                    break  
                case CHECKED:
                case DISABLED:
                case SELECTED:
                case VALUE:
                    D[a] = nextVal
                    break 
                case FOCUS:
                    D['focus']()
                    break
                default:
                    D['setAttribute'](a, nextVal)
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

function shouldExploreFurther (current: VDom, next: VDom, currentType: VDomType, nextType: VDomType): boolean {
    return currentType === nextType &&
            (currentType === VNODE || currentType === VCHILD) &&
            current[0] === next[0]
}

export function vDomToHtmlString (vDom: VDom): string {

    switch (getType(vDom)) {

        case VCHILD:
            vDom[2] = vDom[0](vDom[1])
            return vNodeToHtmlString(vDom[2])

        case VNODE:
            return vNodeToHtmlString(vDom)

        case VATOM:
            return '<span>' + vDom + '</span>'

        default:
            return ''
    }
}

export function vNodeToHtmlString (vDom: VDom): string {

    var tag = vDom[0]
    var attrs = vDom[1]
    var children
    var val
    var a
    var attrPairs = []
    var c
    var res

    vDom[2] = vDom[2] ? vDom[2].filter(isDefined) : [] // !! mutates vDom !!
    children = vDom[2]

    if (attrs) {
        for (a in attrs) {
            val = attrs[a]
            if (!(val === undefined || val === null || val === false) && a !== KEY && a !== ON && a !== HOOKS) { 
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

export function vDomToDom (vDom: VDom): Node {

    switch (getType(vDom)) {

        case VATOM:
        case VNODE:
        case VCHILD: // child rendering is handled by vDomToHtmlString

            if (vDom['length'] === 0) return undefined

            var el = document.createElement('div')
            el.innerHTML = vDomToHtmlString(vDom)
            var dom = el.firstChild
            bindEventsAndMount(vDom, dom)
            return dom

        case VNULL:
            return undefined
    }
}

function bindEventsAndMount (vDom: VDom, D: Node): void {

    var vType = getType(vDom)
    var vNode
    var vAttrs
    var evts
    var evt
    var hooks
    var hook
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
        hooks = vAttrs[HOOKS]
        if (hooks && hooks.mounted) {
            hooks.mounted(D, vAttrs)
        }
    }

    if (children) {
        for (child = 0; child < children.length; child++) {
            bindEventsAndMount(children[child], D.childNodes[child])
        }
    }
}

