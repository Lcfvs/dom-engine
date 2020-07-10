import { template } from '../../lib/backend.js'

export default template(`
<nav>
  <ol>
    {items}
  </ol>
</nav>
`, {
  items: null
})
