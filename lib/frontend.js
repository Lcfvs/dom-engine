import { renderer, serializer } from './dom.js'
export { template } from './template.js'

const { document, trustedTypes, DOMParser, XMLSerializer } = window

const context = {
  document,
  parser: new DOMParser(),
  policy: trustedTypes?.createPolicy('dom-engine', {
    createHTML: source => source
  }),
  serializer: new XMLSerializer()
}

export const render = renderer(context)

export const serialize = serializer(context)
