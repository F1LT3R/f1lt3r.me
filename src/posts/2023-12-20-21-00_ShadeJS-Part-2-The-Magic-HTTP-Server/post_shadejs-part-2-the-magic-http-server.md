---
title: ShadeJS 🌴 Part 2 - The Magic HTTP Server 💫
permalink: shadejs-part-2-the-magic-http-server
thumbnail: thumbnail_shadejs-part-2-the-magic-http-server.avif
featured: true
tags: [Framework, SPA, Web Components, JavaScript]
excerpt: 'This article is Part 2 of the series: Build Your Own SPA Framework with Modular JavaScript, NodeJS and Closed-Shadow Web Components.'
authors: [F1LT3R]
type: series
---

> This article is **Part 2** of the series: **Build Your Own SPA Framework with Modular JavaScript, NodeJS and Closed-Shadow Web Components**.  
> [Part 1](/posts/shadejs-part-1-burn-it-all-down)  |  Part 2

## The Journey Continues

So I got a logo 🌴

And I grabbed some namespaces:

- [NPM](https://www.npmjs.com/~shadejs)
- [GitHub](https://github.com/Shade-JS/ShadeJS/)
- [ShadeJS.com](http://shadejs.com/)

It's time to start working on the HTTP server!


## Server Design

I'll be honest. I hate using bundlers and transpilers. But one of the things I love about them, is the way that imports don't require a file extension.

For example:

```javascript
import foo from './foo' // imports ./foo.mjs
```

Also the ability to get `index.mjs` from it's component directory. 


```javascript
import foo from './my-comp' // imports ./my-comp/index.mjs
```

## Rewrites 

When you setup a web server such as Apache, or Nginx, the server is already using these kind of rules. They are called "rewrites". That's how the server knows to fetch `index.html` when being asked for the root `/`.

So I will need a stack of rewrite rules to check through.

Like this:

```javascript
const rewritePaths = (pathname) => [
    `${pathname}/index.html`,
    `${pathname}.html`,
    `${pathname}.mjs`,
    `${pathname}/index.mjs`,
    `${pathname}.css`,
    `${pathname}/index.css`,
]
```

Now we need to add some logic to:

1. Check for the file if a file extension was found in the request.
1. Check the rewrite paths if there was no extension.
1. Return the OS file location, content-type, etc.  

```javascript
const rewrite = (pathname, extension) => {
    const rewrites = extension ? removeDoubleSlashes([pathname]) : rewritePaths(pathname)

	for (const rewrite of rewrites) {
        const rewriteTarget  = stripStartSlash(rewrite)
		const location = path.resolve('./web', rewriteTarget)

        const stat = getStat(location)
        const {ext} = path.parse(rewriteTarget, true)
        const contentType = headers[ext]
		
		if (stat) {
            return {location, stat, contentType}
		}
	}
}
```

But UT-OH.

I've broken something!

Relative imports no longer work. 

![Code 404 in Browsers Developer Tools](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ccmas3yqwyffh1eqe6sa.png)


## 301 Moved Permanently

When I'm serving a response without the file extension, and that response uses a file import, the browser does not know what that new import is relative to. This breaks my relative imports, throwing a 404 response code.

To handle this I will use the 301 Moved Permanently response code.

```javascript
const hasNoEndSlash = (url) => url.slice(-1) !== '/'

const wasRewritten = (url, location) => url.slice(1) !== path.relative(WEB_DIR, location)

const MovedPermanently301 = (res, location) => {
	res.writeHead(301, {
		Location: `http://localhost:${PORT}/${location}`
	})
	res.write('301 Moved Permanently')
	res.end()
}

const requestHandler = (req, res) => {

	...

	if (hasNoEndSlash(pathname) && wasRewritten(pathname, file.location)) {
		const relativeLocation =  path.relative(WEB_DIR, file.location)
		return MovedPermanently301(res, relativeLocation)
	}

	...

}
```

Fantastic!

Everything loads as expected.


![Expected loading of resources without file extensions](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/tteitswvih5xl0xf2qs1.png)


## Project Structure

So what do these imports look like, and what is the project structure?

![Project structure in VS Code](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/087m1s9j6hsh7ncsctam.png)

In the `./web/index.html` file I am loading my counter component without the file extension.


```html
<!DOCTYPE html>
<html>
<body>
    <h1>Index</h1>
    <my-counter></my-counter>
    <script src="/components/counter" type="module"></script>
</body>
</html>
```

And my counter component imports `index.mjs` from `./web/vendor/Shade/index.mjs`. I'm using a `../` to test that relative imports are really working.

```javascript
import Shade, {css, html} from '../vendor/Shade'

class MyCounter extends HTMLElement {
    title = 'My Awesome Counter'
    count = 0

    style = ({count}) => css`
        h1 {
            color: ${count >= 8 ? 'red' : 'green'};
        }
        ...
    `

    template = ({title, count}) => html`
        <div>
            <h1>${title}</h1>
            ...
        </div>
    `

    constructor() {
        super()
        Shade(this)
    }
    ...
}

window.customElements.define('my-counter', MyCounter)
```

And `css.mjs` and `html.mjs` are exported from `./web/vendor/Shade/index.mjs` via the `lib` directory. Eg:   `./web/vendor/Shade/lib/[html,css].mjs`

```javascript
import html from './lib/html' 
import css from './lib/css' 
import shade from './lib/shade' 

export {html, css}

export default shade
```

## Try It!

Check out Part 2 of the code for yourself. Download it from GitHub and play around with the imports.

https://github.com/Shade-JS/ShadeJS/tree/part-2 

```shell
git clone https://github.com/Shade-JS/ShadeJS.git
cd ShadeJS
git checkout part-2
node run server/server.mjs
```

What do you think?

![ShadeJS GitHub Page](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qjf44kr7wkwmfaauxmms.png)

