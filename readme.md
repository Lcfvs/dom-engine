# @lcf.vs/dom-engine

**[ALPHA]** A composable DOM based template engine


## Install

`npm i @lcf.vs/dom-engine`


## Usage

### Create a fragment template

```js
import { fragment } from '@lcf.vs/dom-engine'

const template = fragment(`
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
  ...template,
  salutations: 'hello',
  name: 'user-name'
}

// object representing <p>hello</p>
const p = {
  ...template,
  salutations: 'hello'
}

// Error: missing {salutations} (on serialization)
const p = {
  ...template
}
```

### Use templates as value

```js
const taggedName = fragment(`
<strong>{name}</strong>
`, {
  name: null
})

// object representing <p>hello <string>user-name</strong></p>
const p = {
  ...template,
  salutations: 'hello',
  name: {
    ...taggedName,
    name: 'user-name'
  }
}

// object representing <p>hello <strong>user-name</strong></p>
const p = {
  ...template,
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
  ...template,
  salutations: 'hello',
  name: fragment(`<span>user-name</span>`)
}
```

## Serialize a template

```js
import { fragment } from '@lcf.vs/dom-engine'

const template = fragment(`<span>user-name</span>`)
const html = serialize(template)
```

## API

```js
import { fragment, serialize } from '@lcf.vs/dom-engine'

const template = fragment(source[, fields])
```

```js
import { document } from '@lcf.vs/dom-engine'

const template = document(source[, fields])
```

```js
import { serialize } from '@lcf.vs/dom-engine'

const rendered = serialize(template)
```


## License

[MIT](./LICENSE)
