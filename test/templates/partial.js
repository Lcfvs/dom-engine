import { template } from '../../lib/backend.js'

export default template(`
{meta},
{refresh}
{main}
`, {
  meta: null,
  fragment: null,
  refresh: ''
})
