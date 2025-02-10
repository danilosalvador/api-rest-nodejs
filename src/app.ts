import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { transactionsRoutes } from './routes/transactions'

export const app = fastify()

app.register(cookie)

/*
Hooks no Fastify são funções que podem ser registradas para serem executadas em diferentes momentos do ciclo de vida de uma requisição

- onRequest: Executado antes da autenticação e antes do processamento da requisição.
- preParsing: Modifica os dados da requisição antes do parsing do corpo.
- preValidation: Executado antes da validação do payload da requisição.
- preHandler: Executado antes do handler da rota (útil para autenticação).
- preSerialization: Modifica a resposta antes de ser serializada.
- onSend: Modifica a resposta antes de enviá-la ao cliente.
- onResponse: Executado após a resposta ser enviada.
- onError: Manipula erros que ocorrem na requisição.
- onReady: Executado quando o servidor está pronto.
- onClose: Executado quando o servidor está fechando.
*/
app.addHook('preHandler', async request => {
    console.log(`[${request.method}] ${request.url}`)
})

app.register(transactionsRoutes, {
    prefix: 'transactions',
})
