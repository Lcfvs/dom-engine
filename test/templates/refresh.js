import { fragment } from '../../lib/engine.js'

export default fragment(`
<meta http-equiv="refresh" content="{delay};URL={url}"> 
`, {
  delay: null,
  url: null
})
