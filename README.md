# Sprezzatura

A small, performant virtual dom library that uses pure functions and javascript literals to describe the dom.

[https://en.wikipedia.org/wiki/Sprezzatura](Sprezzatura) is my favourite word, it is an italian word meaning "a certain nonchalance, so as to conceal all art and make whatever one does or says appear to be without effort and almost without any thought about it." To me, this sounds to be exactly what a virtual dom is doing.

It relies only on the excellent [https://github.com/ashaffer/dift](dift) library and adopts the performance enhancing heuristics pioneered by React.

It was designed for use in combination with [https://github.com/twfarland/acto](acto), which replaces Redux, but you can easily use it with other libraries or standalone.

Written in typescript.

### Install

	npm install --save sprezzatura

### Usage

	import { updateDom, vDomToDom, vDomToHtmlString } from 'sprezzatura'

## Defining views

Views are just pure functions that take an object of properties and return a `vDom`, which is a javascript literal of an acceptable form that maps closely to html:

```typescript
type VDomType = number
type Key = string | number
type VAtom = string | number | boolean | void | null

interface VChildConstructor {
    (props: any): VDom
}

type VNodeSingle = [string] // ['div']
type VNodeAttrs  = [string, any] // ['img', { src: '/pic.png' }]
type VNodeChild  = [string, any, any[]] // ['a', { href: '/' }, ['home']]

type VNode = 
    VNodeSingle 
    | VNodeAttrs 
    | VNodeChild 

type VChild =
    [VChildConstructor, any]

type VDom =
    VAtom
    | VNode 
    | VChild
```

Some concrete examples of valid `vDom`s:

```typescript

['hr']

['input', { type: 'text', value: 123 }]

['a', { href: '/' }, ['home']]

['div', {}, [
	'child1',
	['b', {}, ['child2']],
	'child3'
]]

```
