import { template } from '../../lib/backend.js'

export default template(`
<ol>
  {items}
</ol>
`, {
  items: null
})
