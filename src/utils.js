// --------- Utils

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

// DomNode -> Int -> DomNode -> _
// inserts the child in the parent at index
function insertBeforeIndex (parent, i, child) { 

    var next = parent.childNodes[i]

    if (next) {
        parent.insertBefore(child, next)
    } else {
        parent.appendChild(child)
    }
}

// vDomTag -> vDomTag -> Bool 
// are the two tags of the same type, and if they have an id, is it the same?
function hasSameTagAndId (a, b) { 

    var hasId = toString.call(a[1]) === '[object Object]' && toString.call(b[1]) === '[object Object]' && a[1].id && b[1].id

    return a[0] === b[0] && (!hasId || (hasId && a[1].id === b[1].id))
}

// vDomNode -> Bool
// test whether the node is i.e. is a number or longer than zero
function exists (n) {
    if (n instanceof Array || typeof n === 'string') return n.length > 0
    return !!(n === 0 || n)
}

module.exports = {
    slice: slice,
    insertBeforeIndex: insertBeforeIndex,
    hasSameTagAndId: hasSameTagAndId,
    exists: exists
}