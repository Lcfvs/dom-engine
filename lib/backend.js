import jsdom from 'jsdom'
import { renderer, serializer } from './dom.js'
import { source } from './template.js'
export { template } from './template.js'

const { window } = new jsdom.JSDOM('<!DOCTYPE html>')
const { document, DOMParser, XMLSerializer } = window

const context = {
  document,
  parser: new DOMParser(),
  serializer: new XMLSerializer(),
  source
}

export const render = renderer(context)

export const serialize = serializer(context)
