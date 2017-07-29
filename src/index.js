"use strict";
var dift_1 = require("dift");
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
var HOOKS = 'hooks';
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
    else if ((typeof vDom === STRING && vDom !== "") || typeof vDom === NUMBER) {
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
    return !(v === false || v === undefined || v === null || v === "");
}
function updateChildren(current, next, D) {
    next[2] = next[2] ? prepChildren(next[2]) : []; // !! mutates vDom !!
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
                    var hooks = next[1] && next[1][HOOKS];
                    if (hooks && hooks.shouldUpdate ?
                        hooks.shouldUpdate(current[1], next[1]) :
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
        if (nextVal === undefined || nextVal === null || nextVal === false || nextVal === EMPTYSTRING) {
            switch (a) {
                case ON:
                case HOOKS:
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
        if (!(nextVal === undefined || nextVal === null || nextVal === false || nextVal === EMPTYSTRING) &&
            nextVal !== currentVal &&
            typeof nextVal !== FUNCTION) {
            switch (a) {
                case ON:
                case HOOKS:
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
            return String(vDom);
        default:
            return '';
    }
}
exports.vDomToHtmlString = vDomToHtmlString;
// strips out undefined children and joins any neighbouring strings
// e.g: [null, "a", "b", false, 1, ["div", {}, []], "d"] => ["a b 1",["div",{},[]],"d"]
// TODO: a single loop that strips undefined and joins strings
function prepChildren(children) {
    var prevType;
    var prevI;
    var i;
    var defined = children.filter(isDefined); // strip out undefined
    var res = [];
    var v;
    var vType;
    // join any subsequent atoms into text nodes
    for (i = 0; i < defined.length; i++) {
        v = defined[i];
        vType = getType(v);
        if (vType === VATOM && prevType === VATOM) {
            res[prevI] += " " + v;
        }
        else {
            res.push(v);
            prevI = i;
            prevType = vType;
        }
    }
    return res;
}
exports.prepChildren = prepChildren;
function vNodeToHtmlString(vDom) {
    var tag = vDom[0];
    var attrs = vDom[1];
    var children;
    var val;
    var a;
    var attrPairs = [];
    var c;
    var res;
    vDom[2] = vDom[2] ? prepChildren(vDom[2]) : []; // !! mutates vDom !!
    children = vDom[2];
    if (attrs) {
        for (a in attrs) {
            val = attrs[a];
            if (!(val === undefined || val === null || val === false) && a !== KEY && a !== ON && a !== HOOKS) {
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
            bindEventsAndMount(vDom, dom);
            return dom;
        case VNULL:
            return undefined;
    }
}
exports.vDomToDom = vDomToDom;
function bindEventsAndMount(vDom, D) {
    var vType = getType(vDom);
    var vNode;
    var vAttrs;
    var evts;
    var evt;
    var hooks;
    var hook;
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
        hooks = vAttrs[HOOKS];
        if (hooks && hooks.mounted) {
            hooks.mounted(D, vAttrs);
        }
    }
    if (children) {
        for (child = 0; child < children.length; child++) {
            bindEventsAndMount(children[child], D.childNodes[child]);
        }
    }
}
