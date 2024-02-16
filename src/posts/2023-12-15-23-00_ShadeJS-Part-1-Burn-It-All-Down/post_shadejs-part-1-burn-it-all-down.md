---
title: ShadeJS 🌴 Part 1 — Burn It All Down! 🔥
permalink: shadejs-part-1-burn-it-all-down
thumbnail: thumbnail_shadejs-part-1-burn-it-all-down.avif
featured: true
tags: [Framework, SPA, Web Components, JavaScript]
excerpt: 'This article is Part 1 of the series: Build Your Own SPA Framework with Modular JavaScript, NodeJS and Closed-Shadow Web Components.'
authors: [F1LT3R]
type: series
---

> This article is **Part 1** of the series: **Build Your Own SPA Framework with Modular JavaScript, NodeJS and Closed-Shadow Web Components**.  
> Part 1  |  [Part 2](/posts/shadejs-part-2-the-magic-http-server)

Hi, I'm Al.

And I've decided to make a modern SPA framework that DOES NOT SUCK! 🥳

Why? Because I don't like build systems and code bundlers. Because I don't like 512 terrorbytes of bloatware in my node_modules folder. Because I'm fed up with transpilers, and code-wigglers, and domain-magic fizz-bunglers.

I'm going to burn it all down. 

I just like clean, simple code that doesn't try to be too much.

I'll be opinionated – So my code doesn't have to be.

Why would I want to spend precious ticks refafferating broken build systems when I can just press SHIP? Why should I be micromanaging my minifier for a microseconds gain, when the only code I need to load is that wots on the screen right now? Who cares about types anyway when you can build your whole app with only strings? Why smash my head against a strongly typed api schema just so I can get intellisense?

REALLY?!
Does it make any-sense, to you?

It's too much I tell you.
**TOO MUCH!**

Why can't I just compose deep in flow, rapidly swinging out components into production like Chuck Norris double fisting two pairs of nano-gold nun-chucks?

![Chuck Norris catching some shade and returning it to sender](img/chuck-norris.gif)

I can – I tell you. **AND I WILL!**

No, seriously.

I want to build the most framework-less framework of frameworks, The defaultest default of defaults. The little codebase that couldn't get in your way if it tried.

But how?

## How

**What I will use?**

1. Web Components
2. Modular JavaScript
3. NodeJS
4. JavaScript Runtime Interpreter
5. JavaScript CSS Parsing Engine

**What will features be?**

1. .mjs-Aware HTTP Server
1. Build-less Deployments
1. LIVE Fragments triggering tiny DOM updates
1. Runs under a tight Content Security Policy with no `unsafe-eval` or `unsafe-inline`, etc.
1. Built in Lazy Loading 
1. Two Way Data Binding
1. SPA Integration w/ Browser History
1. Modular CSS Templates
1. Hot Module Swapping (HMR)
1. Storybooks Integration
1. Unit & End-to-End test Integration
1. Recommended VS Code Integrations 
1. Traditional Package Bundling (Maybe)

## Choose a Name

Because I want to take advantage of the performance improvements and tighter security of Closed Shadow Web Components, I'm looking for a name that has something-to-do with "shadows".

![Palm Tree in Window](img/palm-tree-window.jpg)

I like the idea of sitting in the cool shade of a palm tree on hot, sunny day, and that gives me some great ideas for a logo; so I'm thinking "ShadeJS"?

- Domains Available? "YES"
- NPM Names Available? "YES"

It's a done deal.  🤝

## Design The Components

I want to use Web Components as the base for this framework. So I am going to start by designing what a simple component might look like.

**Here's an example of a simple counter component:**

```javascript
import Shade, {css, html} from '/vendor/Shade'

class MyCounter extends HTMLElement {
	title = 'My Awesome Counter'
	count = 0

	style = ({count}) => css`
		h1 {
			color: ${count >= 8 ? 'red' : 'green'};
		}
		p {
			border: 1px dotted black;
			padding: 1rem;
		}
	`

	template = ({title, count}) => html`
		<div>
			<h1>${title}</h1>
			<p>${count}</p>
			<button @click="subtract(1)">Subtract 1</button>
			<button @click="add(1 + 1)">Add 2</button>
		</div>
	`

	constructor() {
		super()
		Shade(this)
	}

	add(amount) {
		this.count += amount
	}

	subtract(amount) {
		this.count -= amount
	}
}


window.customElements.define('my-counter', MyCounter)
```

Having the `style` and `template` as callback functions give me some nice control over the code - control that I can abstract away.

- Pass state into the callback for `style` and `template` to: 
    + Update CSS values like color, eg: `color: ${count >= 8 ? 'red' : 'green'}`
    + Show / Hide portions of the template
- Evaluate & run code in the template, eg: `@click="add(1 + 1)`
- Map arrays to render lists with HTML
- Stringify the `style` and `template` functions to read the temple literal variable names, and update state when mutations happen.


### Going Private

What about private functions? Sometimes need the code to be invisible and untouchable from the outside. So lets think about what that might look like.

Here is a method I could use for private components:

```javascript
import Shade, {css, html} from '/vendor/Shade'

class MyCounter extends HTMLElement {
	#style = () => css`
		h1 {
			color: ${this.#count >= 8 ? 'red' : 'green'};
		}

		p {
			border: 1px dotted black;
			padding: 1rem;
		}
	`

	#template = () => html`
		<div>
			<h1>${this.#title}</h1>
			<p>${this.#count}</p>
			<button @click="#subtract(1)">Subtract 1</button>
			<button @click="#add(1 + 1)">Add 2</button>
		</div>
	`

	#title = 'My Awesome Counter'
	#count = 0

	#add(amount) {
		this.#count += amount
	}

	#subtract(amount) {
		this.#count -= amount
	}

	constructor() {
		super()
		Shade(this, {
			style: this.#style,
			template: this.#template,
			'#add': this.#add,
			'#subtract': this.#subtract,
		})
	}
}

window.customElements.define('my-counter', MyCounter)
```

We can simplify this with a more functional component. Rather than using private members on a class, we can just pass functions and values without any reference to the outer scope.

Here is an example:

```javascript
import Shade, {css, html} from '/vendor/Shade'

const style = ({count}) => css`
	h1 {
		color: ${count >= 8 ? 'red' : 'green'};
	}

	p {
		border: 1px dotted black;
		padding: 1rem;
	}
`

const template = ({title, count}) => html`
	<div>
		<h1>${title}</h1>
		<p>${count}</p>
		<button @click="#subtract(1)">Subtract 1</button>
		<button @click="#add(1 + 1)">Add 2</button>
	</div>
`

function add(amount) {
	this.count += amount
}

function subtract(amount) {
	this.count -= amount
}

const state = {
	title: 'My Awesome Counter',
	count: 0,
}

class MyCounter extends HTMLElement {
	constructor() {
		super()
		Shade(this, {
			style,
			template,
			state,
			add,
			subtract,
		})
	}
}

window.customElements.define('my-counter', MyCounter)
```

## Wrapping Up

So I think I have a solid start on what I want from this framework, and what the developer experience is that I'm aiming for.

Will it be the fastest framework in the wild?
**What is "fast"?**

Will it be the funnest developer experience out there?
**You betcha!**

Whatever happens, it will be a great way to learn some new tricks. And maybe you would like to learn them with me.
