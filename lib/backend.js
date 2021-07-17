import jsdom from 'jsdom'
import { renderer, serializer } from './dom.js'

const symbol = Symbol('source')
const { window } = new jsdom.JSDOM('<!DOCTYPE html>')
const { document, DOMParser, XMLSerializer } = window

export const source = symbol

export const template = (source, { ...data } = {}) => ({
  [symbol]: source,
  ...data
})

const context = {
  document,
  parser: new DOMParser(),
  serializer: new XMLSerializer(),
  source
}

export const render = renderer(context)
export const serialize = serializer(context)