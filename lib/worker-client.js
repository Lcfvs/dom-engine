import { serialize, template } from './frontend.js'

const flag = '@@template'

const templates = new Map()

const init = source => {
  if (!templates.has(source)) {
    templates.set(source, template(source))
  }

  return { ...templates.get(source) }
}

const parse = ([value, source]) => {
  return Object(value) !== value
    ? value
    : Array.isArray(value)
      ? value.map(value => parse([...value]))
      : Object.entries(value).reduce((acc, [name, value]) => ({
        ...acc,
        [name]: parse(value)
      }), (source ?? null) ? init(source) : {})
}

navigator.serviceWorker.addEventListener('message', ({ data, ports }) => {
  const { [flag]: template } = data
  const [port] = ports

  if (port && template) {
    port.postMessage({
      [flag]: `${serialize(parse(template))}`
    })
  }
}, { passive: true })
