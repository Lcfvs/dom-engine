import response from './builders/response.js'
import home from './builders/views/home.js'
import refresh from './templates/refresh.js'

console.log(response({
  lang: 'en',
  view: {
    ...home,
    refresh: {
      ...refresh,
      delay: 5,
      url: '/'
    }
  }
  // xhr: true
}))
