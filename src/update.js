var U = require('./utils')
var T = require('./transformers')

var slice = U.slice, 
    insertBeforeIndex = U.insertBeforeIndex, 
    hasSameTagAndId = U.hasSameTagAndId, 
    exists = U.exists; 

var htmlStringToDom = T.htmlStringToDom, 
    vDomToDom = T.htmlStringToDom, 
    vDomToHtmlString = T.vDomToHtmlString;


// --------- Dom updating

// DomNode -> vDom -> vDom -> _  
// dom updating
// D = real dom, A = current vDom, B = next vDom
function updateDom (D, A, B) { 

    if (!D) return

    var DChildren = slice.call(D.childNodes)
    var AAttrs 	= A[1]
    var BAttrs 	= B[1]
    var AChildren = A[2] || []
    var BChildren = B[2] || []

    if (BAttrs._static) { return }

    updateAttributes(D, AAttrs, BAttrs)

	var keyed = BChildren[0] && BChildren[0][1] && BChildren[0][1]._key
	var childUpdater = keyed ? updateChildrenKeyed : updateChildrenPairwise
    
    childUpdater(D, DChildren, AChildren, BChildren)
}


// DomNode, { attr: val... }, { attr: val... } -> _
// Update the attributes from the new vDom (b) in the old Dom (b) by comparing 
// with attributes of the current vDom (a).
// If it's in a but not in b, it should be removed from d.
// If it's in b, it should be set in d.
function updateAttributes (D, AAttrs, BAttrs) {

    var AAttr, BAttr

    for (AAttr in AAttrs) {

        if (!exists(BAttrs[AAttr])) {

            if (AAttr === 'value') {
                D.value = ''

            } else if (AAttr === 'checked') {
                D.checked = false

            } else if (AAttr === 'selected') {
                D.selected = false
                
            } else if (AAttr.charAt(0) !== '_') {
                D.removeAttribute(AAttr)
                
            } else if (AAttr === '_focus') {
                D.blur()
            }
        }
    } 

    for (BAttr in BAttrs) {

        if (BAttr === 'value' && D !== document.activeElement) {
            D.value = BAttrs[BAttr]

        } else if (BAttr === 'checked') { 
            D.checked = !!BAttrs[BAttr]

        } else if (BAttr === 'selected') {
            D.selected = !!BAttrs[BAttr]

        } else if (BAttr.charAt(0) !== '_') {
            D.setAttribute(BAttr, BAttrs[BAttr])

        } else if (BAttr === '_focus') {
            D.focus()
        }
    }
}

// DomNode -> [DomNode...] -> [VDom...] -> [VDom...] -> _
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
        existsD = typeof d !== 'undefined'
        existsA = exists(a)
        existsB = exists(b)
        
        if (!existsD && !existsA && existsB) { // no d/a, but b
            D.appendChild(vDomToDom(b))

        } else if (existsD && existsA && !existsB) { // d/a, but no b
            D.removeChild(d)

        } else if (existsD && existsA && existsB) { // both

            if ((isTag(a) && isTag(b))) { // tags

                if (hasSameTagAndId(a, b)) { // explore further
                    updateDom(d, a, b)

                } else {
                    D.replaceChild(vDomToDom(b), d) // different tag, regen, no need to explore further
                }

            } else { // atoms
                if (a !== b) {
                    D.replaceChild(vDomToDom(b), d)
                }
            }
        }
    }
}

// DomNode -> [DomNode...] -> [VDom...] -> [VDom...] -> _
// Updates the children in the Dom with a hash-based, keyed strategy
// This is used if the children have unique _key properties
// The _key properties must faithfully represent the entire state of the 
// child and all its attributes/children
function updateChildrenKeyed (D, DChildren, AChildren, BChildren) {

    var d, a, b, i, AKeys = {}, AKey, BKeys = {}, BKey

    for (i = 0; i < Math.max(AChildren.length, BChildren.length); i++) {

        d = DChildren[i]
        a = AChildren[i]
        b = BChildren[i]

        if (exists(a)) AKeys[a[1]._key] = d
        if (exists(b)) BKeys[b[1]._key] = b
    }

    for (AKey in AKeys) {
        if (BKeys[AKey] === undefined) D.removeChild(AKeys[AKey])
    } 

    for (i = 0; i < BChildren.length; i++) {
        b = BChildren[i]
        if (AKeys[b[1]._key] === undefined) insertBeforeIndex(D, i, vDomToDom(b))
    }
}

module.exports = { updateDom: updateDom }