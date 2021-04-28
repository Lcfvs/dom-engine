# @lcf.vs/dom-engine

A composable DOM based template engine


## Install

`npm i @lcf.vs/dom-engine`


## Usage

### Security

This library can require the following header:

`Content-Security-Policy: require-trusted-types-for 'script'; trusted-types dom-engine`

Since the templates filling is intended to avoid XSS injections, by design, you need to be sure about your templates.

### Markers

There is 2 type of markers:

* **Required**: `{name}`
  * The value can't be nullish
* **Optional**: `{?name}`
  * If a nullish value is provided for an attribute, that attribute is removed


### Create a fragment template

```js
import { template } from '@lcf.vs/dom-engine/backend.js'

const pTemplate = template(`
<p class="{?classes}">{salutations} {name}</p>
`, {
  classes: null,
  salutations: null,
  name: null
})
```

### Create a value filled node

```js
// object representing <p>hello user-name</p>
const p = {
  ...pTemplate,
  salutations: 'hello',
  name: 'user-name'
}

// object representing <p>hello</p>
const p = {
  ...pTemplate,
  salutations: 'hello'
}

// Error: missing {salutations} (on serialization)
const p = {
  ...pTemplate
}
```

### Use templates as value

```js
const taggedName = template(`
<strong>{name}</strong>
`, {
  name: null
})

// object representing <p>hello <string>user-name</strong></p>
const p = {
  ...pTemplate,
  salutations: 'hello',
  name: {
    ...taggedName,
    name: 'user-name'
  }
}

// object representing <p>hello <strong>user-name</strong></p>
const p = {
  ...pTemplate,
  salutations: 'hello',
  name: {
    ...taggedName,
    name: 'user-name'
  }
}
```

```js
// object representing <p>hello <strong><span>user-name</span></strong></p>
const p = {
  ...pTemplate,
  salutations: 'hello',
  name: template(`<span>user-name</span>`)
}
```

```js
// object representing <p>hello <strong><span>user</span>-<span>name</span></strong></p>
const p = {
  ...pTemplate,
  salutations: 'hello',
  name: [
    template(`<span>user</span>`),
    template(`-`),
    template(`<span>name</span>`)
  ]
}
```

### Use object properties
```js
// object representing <p>hello <strong>user</strong></p>
const pTemplate = template(`
<p>{salutations} <strong>{user.name}</strong></p>
`, {
  salutations: 'hello',
  user: {
    name: 'user'
  }
})
```


## Serialize a template

```js
import { serialize, template } from '@lcf.vs/dom-engine/lib/backend.js'

const p = template(`<p>user-name</p>`)
const html = serialize(p)
```

## APIs

### Back-End

```js
import { template } from '@lcf.vs/dom-engine/lib/backend.js'

const template = template(source, { ...fields } = {})
```

```js
import { serialize } from '@lcf.vs/dom-engine/lib/backend.js'

const rendered = serialize(template)
```

### Front-End

```js
import { template } from '@lcf.vs/dom-engine/lib/frontend.js'

const template = template(source, { ...fields } = {})
```

```js
import { serialize } from '@lcf.vs/dom-engine/lib/frontend.js'

const rendered = serialize(template)
```

### ServiceWorker

From the version `2.2.0`, the engine also supports the rendering of some templates stored into a `ServiceWorker`.

To use it, you need to add the following components.

#### Into the `window` script

```js
import '@lcf.vs/dom-engine/lib/worker-client.js'
```

#### Into the `ServiceWorker` script

```js
import { serialize, template } from '@lcf.vs/dom-engine/lib/worker.js'

const text = 'This page is built by sw-template'

const view = template(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{text}</title>
  <script src="/main.js" type="module"></script>
</head>
<body>
  <main>
    <h1>{text}</h1>
    <a href="/">back to home</a>
  </main>
</body>
</html>`)

const html = await serialize({
  ...view,
  text
})
```

Just note that: if the browser doesn't support the ES6 modules, into the `ServiceWorker`, you should need to bundle your code.

[A very basic demo](https://glitch.com/edit/#!/dom-engine-sw?path=sw-routes.js%3A25%3A6)

## License

[MIT](./LICENSE)
