import { fragment } from '../../lib/engine.js'

export default fragment(`
<ol>
  {items}
</ol>
`, {
  items: null
})
