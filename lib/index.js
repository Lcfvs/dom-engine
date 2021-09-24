const { document, process } = globalThis

const paths = {
  backend: './backend.js',
  frontend: './frontend.js',
  worker: './worker.js'
}

const path = process
  ? paths.backend
  : document
    ? paths.frontend
    : paths.worker

export const {
  load,
  render,
  serialize,
  source,
  template
} = await import(path)
