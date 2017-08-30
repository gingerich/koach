import request from 'supertest'

import { Provider, Component, Stack } from '../../src'

describe('Stack component', () => {
  let Koach

  beforeEach(() => {
    Koach = new Provider()
  })

  test('empty', () => {
    Koach.registerComponent('App', () => Stack)
    const server = Koach.listen()

    request(server)
      .get('/')
      .expect(404)
      .end(() => server.close())
  })

  test('stack', async () => {
    class MyComponent extends Component {
      compose () {
        return Stack.spec()
          .use(async (ctx, next) => {
            await next()
            ctx.body.test = true
          })
          .use((ctx) => {
            ctx.body = { id: ctx.query.id }
          })
      }
    }

    Koach.registerComponent('App', () => MyComponent)
    const server = Koach.listen()

    await request(server)
      .get('/?id=1234')
      .expect(200, {
        id: '1234',
        test: true
      })
    server.close()
  })
})
