import layout from '../templates/layout.js'
import nav from '../templates/nav.js'
import site from './site.js'

export default {
  ...layout,
  ...site,
  nav: {
    ...nav,
    items: ''
  }
}
