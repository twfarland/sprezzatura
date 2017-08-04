# Sprezzatura

A small, performant virtual dom library that uses pure functions and javascript literals to describe the dom. Written in typescript.

[Sprezzatura](https://en.wikipedia.org/wiki/Sprezzatura) is my favourite word, it is an italian word meaning "a certain nonchalance, so as to conceal all art and make whatever one does or says appear to be without effort and almost without any thought about it." To me, this sounds to be exactly what a virtual dom is doing.

It relies only on the excellent [dift](https://github.com/ashaffer/dift) library and follows the performance enhancing heuristics pioneered by React.

It was designed for use in combination with my FRP/Signals library [acto](https://github.com/twfarland/acto), which can comfortably replace Redux, but you can certainly use it with other libraries or standalone.

### Install

	npm install --save sprezzatura

### Usage

	import { updateDom, vDomToDom, vDomToHtmlString, VDom } from 'sprezzatura'

### Defining views

Views are just pure functions that take an object of properties and return a `vDom`, which is a javascript literal of an acceptable form that maps closely to html. 
We treat an array like a tuple, relying on typescript to enforce the correct form:

```typescript
const Div = 'div'

interface HelloProps {
    name: string;
}

function HelloView ({ name }: HelloProps): VDom {
    return (
        [Div, { id: 'hello' }, [
            "Hello, " + name
        ]]
    )
}
```

You can also nest views, props are passed down as the second element in the array:

```typescript
const Div = 'div'
const A = 'a'

function Parent (): VDom {
    return (
        [Div, {}, [
            [Child, { id: 'a' }],
            [Child, { id: 'b' }]
        ]]
    )
}

function Child ({ id }): VDom {
    return [Div, {}, ['id: ' + id]]
}
```

#### The VDom types / interfaces

```typescript

export type VAtom 
    = string 
    | number 
    | boolean 
    | void 
    | null

export interface VDomView {
    (props: VAttrs): VDom;
}

export interface VAttrs {
    [prop: string]: any;
    key?: string | number;
}

export interface VNode extends Array<any>  {
    0: string;
    1?: VAttrs;   
    2?: VDom[];
}

export interface VChild extends Array<any> {
    0: VDomView;
    1: VAttrs;
}

export type VDom
    = VAtom
    | VNode 
    | VChild
```
