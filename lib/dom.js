const parts = /(^<!doctype [^>]+>|)([\s\S]*)$/i
const identifier = /({[a-z][a-z\d]*(?:\.[a-z][a-z\d]*)*})/gi

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
  const {
    [symbols.node]: node,
    [symbols.window]: window
  } = template
  const {
    document,
    Node
  } = window
  const value = node.nodeType === Node.TEXT_NODE
    ? resolve(node.textContent, template)
    : node.nodeValue.replace(identifier, content => resolve(content, template))

  if (typeof value === 'object') {
    const container = document.createDocumentFragment()
    const nodes = [value].flat()

    nodes.forEach(child => container.appendChild(render(child)))
    node.parentNode.replaceChild(container, node)
  } else {
    node.textContent = value
  }
}

function filter (node) {
  return node.textContent.match(identifier)
}

function find (templates, template) {
  const {
    [symbols.node]: node,
    [symbols.window]: window
  } = template
  const { nodeType } = node
  const { Node } = window
  const {
    attributes = [],
    childNodes = []
  } = node

  return [
    ...templates,
    ...nodeType === Node.TEXT_NODE
      ? [node].filter(filter)
      : [
        ...attributes.filter(filter),
        ...childNodes.map(map, template).reduce(find, [])
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

function replace (template) {
  const {
    [symbols.node]: node,
    [symbols.window]: window
  } = template
  const { document } = window
  const {
    parentNode,
    textContent
  } = node
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

function resolve (content, template) {
  return content.slice(1, -1).split('.')
    .reduce((data, name) => {
      const { [name]: value = null } = data

      if (value === null) {
        throw new Error(`Missing ${content} in \`${template[symbols.source]}\``)
      }

      return value
    }, template)
}

function render (template) {
  const { [symbols.node]: node } = template
  const clone = from(template, node.cloneNode(true))

  return find([], clone)
    .reduce(filler, clone)[symbols.node]
}

function wrap (source) {
  return `<template>${source}</template>`
}

function tree (fragment) {
  const [...templates] = fragment.querySelectorAll('template')

  templates.forEach(template => {
    const {
      content,
      parentNode
    } = template

    tree(content)
    parentNode.replaceChild(content, template)
  })

  return fragment
}

function rewrite (source, match) {
  return source.replace(match, wrap(match))
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

function dom ({
  DOMParser,
  NodeFilter
}, source) {
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

export function template (window, source = '', { ...data } = {}) {
  const {
    doctype,
    node
  } = dom(window, source)

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

  return new XMLSerializer()
    .serializeToString(`${doctype}${render(template)}`)
}
