# @lcf.vs/dom-engine

A composable DOM based template engine


## Install

`npm i @lcf.vs/dom-engine`


## Usage

### Create a fragment template

```js
import { template } from '@lcf.vs/dom-engine/backend.js'

const pTemplate = template(`
<p>{salutations} {name}</p>
`, {
  salutations: null, // required
  name: '' //optional
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

const template = template(source, { ...fields } = {}, type = 'text/html')
```

```js
import { serialize } from '@lcf.vs/dom-engine/lib/backend.js'

const rendered = serialize(template)
```

### Front-End

```js
import { template } from '@lcf.vs/dom-engine/lib/frontend.js'

const template = template(source, { ...fields } = {}, type = 'text/html')
```

```js
import { serialize } from '@lcf.vs/dom-engine/lib/frontend.js'

const rendered = serialize(template)
```


## License

[MIT](./LICENSE)
