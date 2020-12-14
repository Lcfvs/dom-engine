const parts = /(^<!doctype [^>]+>|)([\s\S]*)$/i
const identifier = /({\??[a-z][a-z\d]*(?:\.[a-z][a-z\d]*)*})/gi

export const symbols = {
  doctype: Symbol('dom.doctype'),
  node: Symbol('dom.node'),
  source: Symbol('dom.source'),
  window: Symbol('dom.window')
}

const proto = {
  [symbols.doctype]: null,
  [symbols.node]: null,
  [symbols.source]: null,
  [symbols.window]: null
}

function attribute (template, node) {
  const rules = identify(node.nodeValue)
  const value = resolve(template, rules)

  if (value === null) {
    node.ownerElement.removeAttribute(node.nodeName)
  } else {
    node.nodeValue = value
  }
}

function content (template, node) {
  const rules = identify(node.textContent)
  const value = resolve(template, rules)

  if (value === null) {
    node.remove()
  } else if (typeof value === 'object') {
    const { ownerDocument } = node
    const container = ownerDocument.createDocumentFragment()
    const nodes = [value].flat()

    nodes.forEach(child => container.appendChild(render(child)))
    node.parentNode.replaceChild(container, node)
  } else {
    node.textContent = value
  }
}

function dom ({ DOMParser, NodeFilter }, source) {
  let [, doctype, contents] = source.match(parts)
  const parser = new DOMParser()
  const fragment = parse(parser, doctype, contents)
  const { ownerDocument } = fragment
  const walker = ownerDocument.createTreeWalker(fragment, NodeFilter.SHOW_TEXT)

  while (true) {
    const node = walker.nextNode()

    if (!node || node.parentNode.nodeName === 'TITLE') {
      break
    }

    const matches = node.nodeValue.match(identifier) || []

    contents = matches.reduce(rewrite, contents)
  }

  if (!doctype.length) {
    contents = wrap(contents)
  }

  return {
    doctype,
    node: tree(parse(parser, doctype, contents))
  }
}

function filler (template, node) {
  const { [symbols.window]: window } = template
  const { Node } = window
  const { nodeType } = node
  const wrapped = from(template, node)

  if (nodeType === Node.TEXT_NODE) {
    replace(wrapped)
  } else {
    fill(wrapped)
  }

  return template
}

function fill (template) {
  const { [symbols.node]: node, [symbols.window]: window } = template

  if (node.nodeType === window.Node.TEXT_NODE) {
    content(template, node)
  } else {
    attribute(template, node)
  }
}

function identify (identifier) {
  const rule = identifier.slice(1, -1)
  const [first] = rule
  const optional = first === '?'
  const name = optional ? rule.slice(1) : rule

  return {
    identifier,
    optional,
    name
  }
}

function filter (node) {
  return node.textContent.match(identifier)
}

function find (templates, template) {
  const { [symbols.node]: node, [symbols.window]: window } = template
  const { nodeType } = node
  const { Node } = window
  const { attributes = [], childNodes = [] } = node

  return [
    ...templates,
    ...nodeType === Node.TEXT_NODE
      ? [node].filter(filter)
      : [
        ...[...attributes].filter(filter),
        ...[...childNodes].map(map, template).reduce(find, [])
      ]
  ]
}

function from (template, node) {
  return {
    ...template,
    [symbols.node]: node
  }
}

function map (node) {
  return from(this, node)
}

function parse (parser, doctype, contents) {
  const document = parser.parseFromString(`${doctype}${contents}`, 'text/html')

  if (doctype.length) {
    document.write(contents)

    return document.documentElement
  } else {
    return document.createRange()
      .createContextualFragment(contents)
  }
}

function replace (template) {
  const { [symbols.node]: node, [symbols.window]: window } = template
  const { document } = window
  const { parentNode, textContent } = node
  const container = document.createDocumentFragment()
  const matches = textContent.match(identifier)

  textContent.split(identifier)
    .forEach(expression => {
      const text = document.createTextNode(expression)

      container.appendChild(text)

      if (matches.includes(expression)) {
        fill(from(template, text))
      }
    })

  parentNode.replaceChild(container, node)
}

function resolve (template, { identifier, optional, name }) {
  const { [name]: value = null } = template

  if (value === null && !optional) {
    throw new Error(`Missing ${identifier} in \`${template[symbols.source]}\``)
  }

  return value
}

function render (template) {
  const { [symbols.node]: node } = template
  const clone = from(template, node.cloneNode(true))

  return find([], clone)
    .reduce(filler, clone)[symbols.node]
}

function rewrite (source, match) {
  return source.replace(match, wrap(match))
}

function tree (fragment) {
  const [...templates] = fragment.querySelectorAll('template')

  templates.forEach(template => {
    const { content, parentNode } = template

    tree(content)
    parentNode.replaceChild(content, template)
  })

  return fragment
}

function wrap (source) {
  return `<template>${source}</template>`
}

export function template (window, source = '', { ...data } = {}) {
  const { doctype, node } = dom(window, source)

  return from({
    ...data,
    ...proto,
    [symbols.doctype]: doctype,
    [symbols.source]: source,
    [symbols.window]: window
  }, node)
}

export function serialize (template) {
  const {
    [symbols.doctype]: doctype,
    [symbols.window]: { XMLSerializer }
  } = template

  const source = new XMLSerializer()
    .serializeToString(render(template))

  return `${doctype}${source}`
}
