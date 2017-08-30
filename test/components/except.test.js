import request from 'supertest'
import Except from '../../src/components/Except'
import { Component, Provider } from '../../src'

describe('Except component', () => {
  let Koach

  beforeEach(() => {
    Koach = new Provider()
  })

  test('except', async () => {
    class MyComponent extends Component {
      compose () {
        return Except.spec({ method: 'POST', path: '/users' })
          .use(ctx => ctx.status = 401)
      }
    }

    Koach.registerComponent('App', () => MyComponent)
    const server = Koach.listen()

    await request(server)
      .get('/users')
      .expect(401)

    await request(server)
      .post('/users')
      .expect(404)

    server.close()
  })
})
