const tape = require('tape')
const bent = require('bent')
const getPort = require('get-port')
const nock = require('nock')

const server = require('../server')

const getJSON = bent('json')
const getBuffer = bent('buffer')

const versionsJson = `[
  {"version":"v14.0.0","security":true},
  {"version":"v4.8.6","security":false},
  {"version":"v4.8.5","security":true},
  {"version":"v4.8.4","security":true},
  {"version":"v4.1.1","security":false},
  {"version":"v4.1.0","security":false},
  {"version":"v0.10.48","security":true},
  {"version":"v0.10.47","security":true},
  {"version":"v0.10.46","security":true},
  {"version":"v0.10.45","security":false},
  {"version":"v0.4.9","security":false}
]`

// Use `nock` to prevent live calls to remote services
const mockSuccessApiResponse = () => {
  nock('https://nodejs.org/')
    .get('/dist/index.json')
    .reply(200, versionsJson)
}

const mockFailApiResponse = () => {
  nock('https://nodejs.org/')
    .get('/dist/index.json')
    .reply(404, '')
}

const context = {}

tape('setup', async function (t) {
  const port = await getPort()
  context.server = server(port)
  context.origin = `http://localhost:${port}`

  t.end()
})

tape('should get dependencies', async function (t) {
  const html = (await getBuffer(`${context.origin}/dependencies`)).toString()

  t.equal(html.includes('bent -'), true, 'should contain bent')
  t.equal(html.includes('express -'), true, 'should contain express')
  t.equal(html.includes('hbs -'), true, 'should contain hbs')
})

tape('get minimum secure version', (t) => {
  t.test('should get minimum secure versions', async function (t) {
    mockSuccessApiResponse()
    const response = (await getJSON(`${context.origin}/minimum-secure`))

    t.equal(response.v0.version, 'v0.10.46', 'v0 version should match')
    t.equal(response.v4.version, 'v4.8.4', 'v4 version should match')
  })

  t.test('should handle errors', async (t) => {
    mockFailApiResponse()

    try {
      await getJSON(`${context.origin}/minimum-secure`)
      t.fail('request should return 500')
    } catch (e) {
      t.equal(e.statusCode, 500, 'should return correct error message')
    }
  })
})

tape('get latest releases', (t) => {
  t.test('should get latest releases', async function (t) {
    mockSuccessApiResponse()
    const response = (await getJSON(`${context.origin}/latest-releases`))

    t.equal(response.v0.version, 'v0.10.48', 'v0 version should match')
    t.equal(response.v4.version, 'v4.8.6', 'v4 version should match')
  })

  t.test('should handle errors', async (t) => {
    mockFailApiResponse()

    try {
      await getJSON(`${context.origin}/latest-releases`)
      t.fail('request should return 500')
    } catch (e) {
      t.equal(e.statusCode, 500, 'should return correct error message')
    }
  })
})

tape('teardown', function (t) {
  context.server.close()
  t.end()
})
