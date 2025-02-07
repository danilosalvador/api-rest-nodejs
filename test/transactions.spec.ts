import { execSync } from 'node:child_process'

import {
    afterAll,
    beforeAll,
    it,
    describe,
    expect,
    beforeEach,
    afterEach,
} from 'vitest'
import request from 'supertest'

import { app } from '../src/app'

describe('Transactions routes', () => {
    // Executa UMA vez ANTES do primeiro teste
    beforeAll(async () => {
        await app.ready()
    })

    // Executa UMA vez DEPOIS do último teste
    afterAll(async () => {
        await app.close()
    })

    // Executa ANTES de CADA teste
    beforeEach(() => {
        execSync('npm run knex migrate:latest')
    })

    // Executa DEPOIS de CADA teste
    afterEach(() => {
        execSync('npm run knex migrate:rollback --all')
    })

    it('should be able to create a new transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 18500,
                type: 'credit',
            })
            .expect(201)
    })

    it.todo('test pending...')
    it.skip('test skipped...')
    //it.only('test only...')

    it('should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 18500,
                type: 'credit',
            })

        const cookies = createTransactionResponse.get('Set-Cookie') ?? []

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New transaction',
                amount: 18500,
            }),
        ])
    })

    it('should be able to get a specific transaction', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 18500,
                type: 'credit',
            })

        const cookies = createTransactionResponse.get('Set-Cookie') ?? []

        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)

        const transactionId = listTransactionsResponse.body.transactions[0].id

        const getTransactionResponse = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amount: 18500,
            })
        )
    })

    it('should be able to get then summary', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'Credit transaction',
                amount: 18500,
                type: 'credit',
            })

        const cookies = createTransactionResponse.get('Set-Cookie') ?? []

        await request(app.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
                title: 'Debit transaction',
                amount: 0.5,
                type: 'debit',
            })

        const summaryResponse = await request(app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200)

        expect(summaryResponse.body.summary).toEqual({
            amount: 18500 - 0.5,
        })
    })
})
