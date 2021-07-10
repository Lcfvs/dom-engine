import { renderer, serializer } from './dom.js'

const symbol = Symbol('source')

export const source = symbol

export const template = (source, { ...data } = {}) => ({
  [symbol]: source,
  ...data
})

const { document, trustedTypes, DOMParser, XMLSerializer } = window

const context = {
  document,
  parser: new DOMParser(),
  policy: trustedTypes?.createPolicy('dom-engine', {
    createHTML: source => source
  }),
  serializer: new XMLSerializer(),
  source
}

export const render = renderer(context)

export const serialize = serializer(context)
