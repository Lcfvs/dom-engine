import { template } from '../../lib/backend.js'

export default template(`
<title>{title} - {branding}</title>
<meta name="description" content="{description}">
`, {
  branding: null,
  description: null,
  title: null
})
