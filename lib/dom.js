/**
 * @name identifier
 * @type {RegExp}
 */
const identifier = /({[a-z][a-z\d]*(?:\.[a-z][a-z\d]*)*})/gi

/**
 * @name symbols
 * @type {{node: symbol, window: symbol, render: symbol}}
 */
const symbols = {
  node: Symbol('dom.node'),
  render: Symbol('dom.render'),
  window: Symbol('dom.window')
}

/**
 * @typedef {Object} Template
 */
/**
 * @memberOf Template
 * @name {@link symbols.node}
 * @type {Function}
 */
/**
 * @memberOf Template
 * @name {@link symbols.render}
 * @type {Function}
 */
/**
 * @memberOf Template
 * @name {@link symbols.window}
 * @type {Function}
 */

/**
 * @type {Template} proto
 */
const proto = {
  [symbols.node]: null,
  [symbols.window]: null,
  [symbols.render] () {
    const { [symbols.node]: node } = this
    const clone = from(this, node)

    return find([], clone)
      .reduce(filler, clone)[symbols.node]
  }
}

/**
 * @param {Template} template
 * @param {Node} node
 */
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

/**
 * @param {Template} template
 */
function fill (template) {
  const { [symbols.node]: node, [symbols.window]: window } = template
  const { document, Node } = window
  try {
    const value = node.nodeType === Node.TEXT_NODE
      ? resolve(node.textContent, template)
      : node.nodeValue.replace(identifier, content => resolve(content, template))

    if (typeof value === 'object') {
      const container = document.createDocumentFragment()
      const nodes = [value].flat()

      nodes.forEach(child => container.appendChild(child[symbols.render]()))
      node.parentNode.replaceChild(container, node)
    } else {
      node.textContent = value
    }
  } catch (e) {
    console.log(node[symbols.node].name)
    console.error(e)
    process.exit()
  }
}

/**
 * @param {Node} node
 * @return {string[]}
 */
function filter (node) {
  return node.textContent.match(identifier)
}

/**
 * @param {Template[]} templates
 * @param {Template} template
 * @return {Template[]}
 */
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

/**
 * @param {Template} template
 * @param {Node} node
 * @return {Template}
 */
function from (template, node) {
  return {
    ...template,
    [symbols.node]: node
  }
}

/**
 * @param {Node} node
 * @return {Template}
 */
function map (node) {
  return from(this, node)
}

/**
 * @param {window} window
 * @param {string} source
 * @param {string} type
 * @return {Document|DocumentFragment}
 */
function parse ({ document, DOMParser }, source, type) {
  return source.slice(0, 9).toLowerCase() === '<!doctype'
    ? new DOMParser().parseFromString(source, type)
    : document.createRange().createContextualFragment(source)
}

/**
 * @param {Template} template
 */
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

/**
 * @param {string} content
 * @param {Object} data
 * @return {boolean|number|string|Template|Template[]}
 */
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

/**
 * @param {Window} window
 * @param {string} [source]
 * @param {Object} [data]
 * @param {string} [type
 * @return {Template}
 */
export function template (window, source = '', { ...data } = {}, type = 'text/html') {
  return from({
    ...data,
    ...proto,
    [symbols.window]: window
  }, parse(window, source, type))
}

/**
 * @param {Template} template
 * @return {string}
 */
export function serialize (template) {
  const { [symbols.window]: { XMLSerializer } } = template
  const node = template[symbols.render]()

  return new XMLSerializer().serializeToString(node)
}
