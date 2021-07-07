import jsdom from 'jsdom'
import { renderer, serializer } from './dom.js'
export { template } from './template.js'

const { window } = new jsdom.JSDOM('<!DOCTYPE html>')
const { document, DOMParser, XMLSerializer } = window

const context = {
  document,
  parser: new DOMParser(),
  serializer: new XMLSerializer()
}

export const render = renderer(context)

export const serialize = serializer(context)
