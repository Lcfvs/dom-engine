import { fragment } from '../../lib/engine.js'

export default fragment(`
{meta},
{refresh}
{main}
`, {
  meta: null,
  fragment: null,
  refresh: ''
})
