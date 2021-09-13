import { readFile } from 'fs/promises'
import { renderer, serializer } from './dom.js'

const symbol = Symbol('source')
const read = response => response.text()

export const source = symbol

export const template = (source, { ...data } = {}) => ({
  [symbol]: source,
  ...data
})

export const load = async ({ url }, { ...options } = {}, { ...data } = {}) => {
  const parts = url.split('.')

  parts.splice(-1, 1, 'html')

  return template(await fetch(parts.join('.'), options).then(read), data)
}

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
