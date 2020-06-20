import jsdom from 'jsdom'

const { JSDOM } = jsdom
const { window } = parse()
const { Node, XMLSerializer } = window
const render = Symbol('render')
const root = Symbol('root')

const identifier = /({[a-z][a-z\d]*(?:\.[a-z][a-z\d]*)*})/gi
const cleaner = /^<div[^>]+>(.*)<\/div>$/ms
const serializer = new XMLSerializer()

function parse (source = '<!DOCTYPE html>') {
  return new JSDOM(source)
}

function fill (node, data) {
  const value = node.nodeType === Node.TEXT_NODE
    ? resolve(node.textContent, data)
    : node.textContent.replace(identifier, content => resolve(content, data))

  if (typeof value === 'object') {
    const container = fragment()[render]()
    const nodes = [value].flat()

    nodes.forEach(child => container.appendChild(child[render]()))
    node.parentNode.replaceChild(container, node)
  } else {
    node.textContent = value
  }
}

function resolve (content, data) {
  return content.slice(1, -1).split('.')
    .reduce((data, name) => {
      const { [name]: value = null } = data

      if (value === null) {
        throw new Error(`Missing ${content}`)
      }

      return value
    }, data)
}

function find (nodes, node) {
  const { nodeType } = node
  const { attributes = [], childNodes = [] } = node

  return [
    ...nodes,
    ...nodeType === Node.TEXT_NODE
      ? [node].filter(filter)
      : [
        ...[...attributes].filter(filter),
        ...[...childNodes].reduce(find, [])
      ]
  ]
}

function replace (node, data) {
  const { ownerDocument, parentNode, textContent } = node
  const container = ownerDocument.createDocumentFragment()
  const matches = textContent.match(identifier)

  textContent.split(identifier)
    .forEach(expression => {
      const text = ownerDocument.createTextNode(expression)

      container.appendChild(text)

      if (matches.includes(expression)) {
        fill(text, data)
      }
    })

  parentNode.replaceChild(container, node)
}

function filter ({ textContent }) {
  return textContent.match(identifier)
}

function node (node, data) {
  return {
    ...data,
    [render] () {
      const cloned = node.cloneNode(true)

      find([], cloned).forEach(node => {
        const { nodeType } = node

        if (nodeType === Node.TEXT_NODE) {
          replace(node, this)
        } else {
          fill(node, this)
        }
      })

      return cloned
    }
  }
}

export function document (source = '', { ...data } = {}) {
  return node(new JSDOM(source.trim()).window.document, {
    ...data,
    [root]: true
  })
}

export function fragment (source = '', { ...data } = {}) {
  return node(JSDOM.fragment(source.trim()), data)
}

export function serialize (node) {
  if (!node[root]) {
    const wrapper = fragment('<div>{node}</div>', { node })[render]()
    const [, source] = serializer.serializeToString(wrapper).match(cleaner)

    return source
  }

  const dom = parse()
  const { documentElement } = node[render]()
  const { window: { document } } = dom

  document.replaceChild(documentElement, document.documentElement)

  return dom.serialize()
}
