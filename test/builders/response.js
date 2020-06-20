import page from './page.js'
import partial from './partial.js'
import { serialize } from '../../lib/engine.js'

export default function response ({
  lang = 'en',
  view: { ...view },
  xhr = false
}) {
  return serialize({
    ...xhr && partial || page,
    ...view,
    lang
  })
}
