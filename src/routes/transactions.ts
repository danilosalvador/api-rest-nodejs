import { randomUUID } from 'node:crypto'

import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import { db } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id'

export async function transactionsRoutes(app: FastifyInstance) {
    app.get('/', { preHandler: [checkSessionIdExists] }, async request => {
        const { session_id } = request.cookies

        const transactions = await db('transactions')
            .where('session_id', session_id)
            .select()

        return { transactions }
    })

    app.get('/:id', { preHandler: [checkSessionIdExists] }, async request => {
        const paramsSchema = z.object({
            id: z.string().uuid(),
        })

        const { id } = paramsSchema.parse(request.params)
        const { session_id } = request.cookies

        const transaction = await db('transactions')
            .where({ session_id, id })
            .first()

        return { transaction }
    })

    app.get(
        '/summary',
        { preHandler: [checkSessionIdExists] },
        async request => {
            const { session_id } = request.cookies

            const summary = await db('transactions')
                .where({
                    session_id,
                })
                .sum('amount', { as: 'amount' })
                .first()

            return { summary }
        }
    )

    app.post('/', async (request, response) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(
            request.body
        )

        let session_id = request.cookies.session_id

        if (!session_id) {
            session_id = randomUUID()

            response.cookie('session_id', session_id, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
        }

        await db('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id,
        })

        return response.status(201).send()
    })
}
