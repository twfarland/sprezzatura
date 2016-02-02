var U = require('./utils')
var exists = U.exists

// ---------- Virtual dom / dom / string transformers

// HtmlString -> DomNode
function htmlStringToDom (str) {
    var el = document.createElement('div')
    el.innerHTML = str
    return el.firstChild
}

// vDomNode -> DomNode
function vDomToDom (v) {
    return htmlStringToDom(vDomToHtmlString(v))
}

// vDomNode -> HtmlString
function vDomToHtmlString (v) {

    if (v instanceof Array) { // tag

        var tag = v[0],
            attrs = v[1],
            children = v[2],
        	a,
        	attrPairs = [],
        	c,
    		res

        for (a in attrs) {
            if (exists(attrs[a]) && a[0] !== '_') { 
            	attrPairs.push(a + '="' + attrs[a] + '"') 
            }
        }

        res = '<' + [tag].concat(attrPairs).join(' ') + '>'

        if (!voidElements[tag]) {
            for (c = 0; c < children.length; c++) { 
            	res += vDomToHtmlString(children[c]) 
            }
            res += '</' + tag + '>'
        }

        return res

    } else if (typeof v === 'string') { // atom
        return v

    } else if (v !== false && v !== null && typeof v !== 'undefined' && v.toString) {
        return v.toString()

    } else {
        return ''
    }
}

module.exports = {
    htmlStringToDom: htmlStringToDom,
    vDomToDom: vDomToDom,
    vDomToHtmlString: vDomToHtmlString
}