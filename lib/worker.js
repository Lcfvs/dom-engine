const {
  entries,
  fromEntries,
  hasOwnProperty
} = Object

const flag = '@@template'

const once = true

const passive = true

const symbol = Symbol('source')

const matcher = {
  includeUncontrolled: true,
  type: 'window'
}

const isHidden = ({ visibilityState }) => visibilityState === 'hidden'

const random = values => {
  return values[[...values.keys()]
    .filter(isHidden)[~~(Math.random() * (values.length + 1))] ?? 0]
}

const parse = (parsed, [name, value]) => typeof value === 'function'
  ? parsed
  : [...parsed, [name, format(value)]]

const format = value => {
  return typeof value !== 'object' || hasOwnProperty.call(value, 'toString')
    ? [value?.toString()]
    : Array.isArray(value)
      ? [[...value.values()].map(format)]
      : [fromEntries(entries(value).reduce(parse, [])), value[symbol]]
}

const send = (template, client) => resolve => {
  const { port1, port2 } = new MessageChannel()
  const listener = ({ data: { [flag]: template } }) => resolve(template)

  port1.addEventListener('message', listener, { once, passive })
  client.postMessage({ [flag]: template }, [port2])
  port1.start()
}

export const serialize = async ({ [symbol]: source, ...data }) => {
  const client = random(await self.clients.matchAll(matcher))

  if (!client) {
    throw new Error('No available client')
  }

  return new Promise(send(format({ [symbol]: source, ...data }), client))
}

export const template = (source = '', { ...data } = {}) => {
  return {
    [symbol]: source,
    ...data
  }
}
