import { template } from '../../lib/backend.js'

export default template(`<main class="{class}">
  <h1>{title}</h1>
  {contents}
</main>`, {
  class: null,
  contents: null,
  title: null
})
