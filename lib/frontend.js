import { serializer } from './dom.js'
export { template } from './template.js'

const { document, trustedTypes, DOMParser, XMLSerializer } = window

export const serialize = serializer({
  document,
  parser: new DOMParser(),
  policy: trustedTypes?.createPolicy('dom-engine', {
    createHTML: source => source
  }),
  serializer: new XMLSerializer()
})
