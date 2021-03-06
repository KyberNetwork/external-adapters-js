import { assert } from 'chai'
import { Requester } from '@chainlink/external-adapter'
import { assertSuccess, assertError } from '@chainlink/adapter-test-helpers'
import { AdapterRequest } from '@chainlink/types'
import { makeExecute } from '../src/adapter'

describe('execute', () => {
  process.env.API_KEY = process.env.API_KEY ?? 'test_API_key'
  const jobID = '1'
  const execute = makeExecute()

  context('successful calls @integration', () => {
    const requests = [
      {
        name: 'id not supplied',
        testData: { data: { base: 'btc', quote: 'usd' } },
      },
      {
        name: 'ticker',
        testData: { id: jobID, data: { base: 'btc', quote: 'usd' } },
      },
      {
        name: 'ticker & field',
        testData: { id: jobID, data: { endpoint: 'iex', ticker: 'aapl', field: 'open' } },
      },
      {
        name: 'iex endpoint',
        testData: { id: jobID, data: { ticker: 'aapl', endpoint: 'stock' } },
      },
      {
        name: 'eod endpoint',
        testData: { id: jobID, data: { ticker: 'aapl', endpoint: 'eod' } },
      },
      {
        name: 'top endpoint',
        testData: { id: jobID, data: { base: 'btc', quote: 'usd', endpoint: 'top' } },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, async () => {
        const data = await execute(req.testData as AdapterRequest)
        assertSuccess({ expected: 200, actual: data.statusCode }, data, jobID)
        assert.isAbove(data.result, 0)
        assert.isAbove(data.data.result, 0)
      })
    })
  })

  context('validation error', () => {
    const requests = [
      { name: 'empty body', testData: {} },
      { name: 'empty data', testData: { data: {} } },
      {
        name: 'ticker not supplied',
        testData: { id: jobID, data: { field: 'open' } },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, async () => {
        try {
          await execute(req.testData as AdapterRequest)
        } catch (error) {
          const errorResp = Requester.errored(jobID, error)
          assertError({ expected: 400, actual: errorResp.statusCode }, errorResp, jobID)
        }
      })
    })
  })

  context('error calls @integration', () => {
    const requests = [
      {
        name: 'unknown ticker',
        testData: { id: jobID, data: { endpoint: 'iex', ticker: 'not_real' } },
      },
      {
        name: 'unknown field',
        testData: { id: jobID, data: { endpoint: 'iex', ticker: 'aapl', field: 'not_real' } },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, async () => {
        try {
          await execute(req.testData as AdapterRequest)
        } catch (error) {
          const errorResp = Requester.errored(jobID, error)
          assertError({ expected: 500, actual: errorResp.statusCode }, errorResp, jobID)
        }
      })
    })
  })
})
