import jsdom from 'jsdom'
import { serializer } from './dom.js'
export { template } from './template.js'

const { window } = new jsdom.JSDOM('<!DOCTYPE html>')
const { document, DOMParser, XMLSerializer } = window

export const serialize = serializer({
  document,
  parser: new DOMParser(),
  serializer: new XMLSerializer()
})
