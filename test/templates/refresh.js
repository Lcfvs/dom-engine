import { template } from '../../lib/backend.js'

export default template(`
<meta http-equiv="refresh" content="{delay};URL={url}"> 
`, {
  delay: null,
  url: null
})
