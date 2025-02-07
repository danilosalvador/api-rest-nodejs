import type { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionIdExists(
    request: FastifyRequest,
    response: FastifyReply
) {
    const { session_id } = request.cookies

    if (!session_id) {
        return response.status(401).send({
            error: 'Unauthorized',
        })
    }
}
