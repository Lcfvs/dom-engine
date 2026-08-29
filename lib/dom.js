let context = null
const fragments = new Map()

const symbols = {
  doctype: Symbol('doctype'),
  node: Symbol('node'),
  map: Symbol('map')
}

const parts = /(^\s*<!doctype [^>]+>|)([\s\S]*)$/i
const identifier = /{((\??)([a-z]\w*(?:\.[a-z]\w*)*))}/g
const attribute = /(<!--dom-engine::(\??)([a-z]\w*(?:\.[a-z]\w*)*)::dom-engine-->)/g
const text = /^(dom-engine::(\??)([a-z]\w*(?:\.[a-z]\w*)*)::dom-engine)$/g
const escaped = /^(&lt;!--dom-engine::(\??)([a-z]\w*(?:\.[a-z]\w*)*)::dom-engine--&gt;)/g

const html = source => context.policy?.createHTML(source) ?? source

const mark = source => source.replace(identifier, '<!--dom-engine::$1::dom-engine-->')

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
    const { nodeName } = current
    const attributes = new Map()
    let tokens = []

    if (current.nodeType === 1) {
      for (const { name, value } of current.attributes) {
        const attributeTokens = identify(attribute, value)

        if (attributeTokens.length) {
          attributes.set(name, attributeTokens)
        }
      }
    }

    if (nodeName === 'TITLE') {
      tokens = identify(escaped, current.innerHTML)
    } else if (nodeName === 'SCRIPT') {
      tokens = identify(attribute, current.textContent)
    } else if (nodeName === 'TEXTAREA') {
      tokens = identify(attribute, current.value)
    } else if (current.nodeType !== 1) {
      tokens = identify(text, current.nodeValue)
    }

    if (attributes.size || tokens.length) {
      map.set(key, { attributes, tokens })
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

    for (const [name, attributeTokens] of attributes) {
      value(attributeTokens, node, name, template)
    }

    if (tokens.length) {
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

  const initial = node.getAttribute(name)
  let value = initial

  for (const { identifier, key, optional } of tokens) {
    const parts = value.split(identifier)
    const resolved = resolve(key, optional, template)

    value = parts.join(resolved || '')
  }

  if (length === 1 && value === '' && initial === tokens[0].identifier) {
    node.removeAttribute(name)
  } else {
    node.setAttribute(name, value)
  }
}

const content = (tokens, node, template) => {
  const nodes = []
  let [target, content, asValue] = pick(node)

  for (const { identifier, key, optional } of tokens) {
    const [prefix] = content.split(identifier)
    const value = resolve(key, optional, template)
    const replacements = Array.isArray(value)
      ? value
      : value && typeof value === 'object' && value[Symbol.iterator]
        ? [...new Map(value).values()]
        : [value]

    nodes.push(prefix, ...replacements.filter(isFilled).map(child))
    content = content.replace(`${prefix}${identifier}`, '')
  }

  if (asValue) {
    target.textContent = nodes.join('')
  } else {
    target.replaceWith(...nodes, content)
  }
}

const pick = node => {
  const { nodeName } = node

  if (nodeName === 'TITLE') {
    return [node.firstChild, node.innerHTML]
  }

  if (nodeName === 'SCRIPT') {
    return [node.firstChild, node.textContent]
  }

  if (nodeName === 'TEXTAREA') {
    return [node, node.value, true]
  }

  return [node, node.nodeValue]
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
