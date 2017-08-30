import request from 'supertest'
import Spec from '../../src/lib/Spec'

import { Provider, Mount } from '../../src'

describe('Mount', () => {
  let Koach

  beforeEach(() => {
    Koach = new Provider()
  })

  test('mounts middleware at path', async () => {
    const m = Mount.spec({ path: '/path' }).use(ctx => ctx.body = 'test')
    const fn = Spec.compose(m)

    const server = Koach.createServer()
    server.use(fn)
    const http = server.listen()

    await request(http)
      .get('/')
      .expect(404)

    await request(http)
      .get('/path')
      .expect(200, 'test')

    server.disconnect()
  })
})
