import { fragment } from '../../lib/engine.js'

export default fragment(`<main class="{class}">
  <h1>{title}</h1>
  {contents}
</main>`, {
  class: null,
  contents: null,
  title: null
})
