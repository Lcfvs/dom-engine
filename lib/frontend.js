import { renderer, serializer } from './dom.js'
import { source } from './template.js'
export { template } from './template.js'

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
