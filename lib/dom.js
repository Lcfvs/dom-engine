let context = null
const fragments = new Map()

const symbols = {
  doctype: Symbol('doctype'),
  node: Symbol('node'),
  map: Symbol('map')
}

const parts = /(^\s*<!doctype [^>]+>|)([\s\S]*)$/i
const identifier = /{((\??)([a-z][a-z\d_]*(?:\.[a-z][a-z\d_]*)*))}/gi
const attribute = /(<!--de:(\??)([a-z][a-z\d_]*(?:\.[a-z][a-z\d_]*)*):de-->)/gi
const text = /^(de:(\??)([a-z][a-z\d_]*(?:\.[a-z][a-z\d_]*)*):de)$/gi

const html = source => context.policy?.createHTML(source) ?? source

const mark = source => source.replace(identifier, '<!--de:$1:de-->')

const search = node => {
  const { ownerDocument } = node
  const nodes = []
  const iterator = ownerDocument.createNodeIterator(node, 129)
  let current

  while (current = iterator.nextNode()) {
    nodes.push(current)
  }

  return nodes
}

const tokenize = node => {
  const map = new Map()

  for (const [key, current] of search(node).entries()) {
    if (current.nodeType === 1) {
      const attributes = new Map()

      for (const { name, value } of current.attributes) {
        const tokens = identify(attribute, value)

        if (tokens.length) {
          attributes.set(name, tokens)
        }
      }

      if (attributes.size) {
        map.set(key, {
          attributes
        })
      }
    } else {
      const { nodeValue } = current
      const tokens = identify(text, nodeValue)
      console.log(tokens)

      if (tokens) {
        map.set(key, { tokens })
      }
    }
  }

  return map
}

const identify = (pattern, value) => [...value.matchAll(pattern)].map(token)

const token = ([, identifier, optional, key]) => ({
  identifier,
  key,
  optional: optional === '?'
})

const any = source => {
  const { parser } = context
  const [, doctype] = source.match(parts)

  if (!doctype) {
    return fragment(source)
  }

  const node = parser
    .parseFromString(html(mark(source)), 'text/html')
    .documentElement

  return {
    [context.source]: source,
    [symbols.doctype]: doctype,
    [symbols.node]: node,
    [symbols.map]: tokenize(node)
  }
}

const fragment = source => {
  const { document } = context
  const template = document.createElement('template')

  template.innerHTML = html(mark(source))

  return {
    [context.source]: source,
    [symbols.doctype]: '',
    [symbols.node]: template.content,
    [symbols.map]: tokenize(template.content)
  }
}

const clone = (template, parse) => {
  const { [context.source]: source } = template

  if (!fragments.has(source)) {
    fragments.set(source, parse(source))
  }

  const fragment = fragments.get(source)

  return {
    ...template,
    ...fragment,
    [symbols.node]: fragment[symbols.node].cloneNode(true)
  }
}

const isFilled = (value = null) => value !== null

const fill = template => {
  const { [symbols.node]: node, [symbols.map]: map } = template
  const nodes = search(node)

  for (const [key, { attributes, tokens }] of map) {
    const node = nodes[key]

    if (attributes) {
      for (let [name, tokens] of attributes) {
        value(tokens, node, name, template)
      }
    } else if (tokens) {
      content(tokens, node, template)
    }
  }

  return node
}

const value = (tokens, node, name, template) => {
  const { length } = tokens

  if (!length) {
    return
  }

  const values = []
  const initial = node.getAttribute(name)
  let value = initial

  for (const { identifier, key, optional } of tokens) {
    const [prefix] = value.split(identifier)
    const resolved = resolve(key, optional, template)

    values.push(prefix, resolved)
    value = value.replace(`${prefix}${identifier}`, '')
  }

  value = values.join('')

  if (length === 1 && value === '' && initial === tokens[0].identifier) {
    node.removeAttribute(name)
  } else {
    node.setAttribute(name, value)
  }
}

const content = (tokens, node, template) => {
  const nodes = []
  let { nodeValue } = node

  for (const { identifier, key, optional } of tokens) {
    const [prefix] = nodeValue.split(identifier)
    const value = resolve(key, optional, template)
    const replacements = Array.isArray(value)
      ? value
      : value && typeof value === 'object' && value[Symbol.iterator]
        ? [...new Map(value).values()]
        : [value]

    nodes.push(prefix, ...replacements.filter(isFilled).map(child))
    nodeValue = nodeValue.replace(`${prefix}${identifier}`, '')
  }

  node.replaceWith(...nodes, nodeValue)
}

function child (value) {
  return value?.[context.source]
    ? fill(clone(value, fragment))
    : value
}

const resolve = (key, optional, template) => {
  const source = template[context.source]

  return key.split('.')
    .reduce((data, name) => {
      const { [name]: value = null } = data ?? {}

      if (value === null && !optional) {
        throw new Error(`Missing ${key} in \`${source}\``)
      }

      return value
    }, template)
}

export const renderer = ({ document, parser, policy, source }) => {
  if (!context) {
    context = { document, parser, policy, source }
  }

  return template => {
    const cloned = clone(template, any)
    const { [symbols.node]: node } = cloned

    fill(cloned)

    return node
  }
}

export const serializer = ({ document, parser, policy, serializer, source }) => {
  if (!context) {
    context = { document, parser, policy, source }
  }

  return async template => {
    const cloned = clone(template, any)
    const { [symbols.doctype]: doctype, [symbols.node]: node } = cloned

    fill(cloned)

    return html(`${doctype}${serializer.serializeToString(node)}`)
  }
}
