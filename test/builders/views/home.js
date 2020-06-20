import main from '../../templates/main.js'
import meta from '../../templates/meta.js'
import site from '../site.js'

const title = 'Homepage'
const description = 'Page description'

export default {
  meta: {
    ...meta,
    ...site,
    description,
    title
  },
  main: {
    ...main,
    class: 'home',
    contents: '',
    title
  }
}
