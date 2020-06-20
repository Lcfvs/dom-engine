import { fragment } from '../../lib/engine.js'

export default fragment(`
<nav>
  <ol>
    {items}
  </ol>
</nav>
`, {
  items: null
})
