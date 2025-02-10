import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
    config({ path: '.env.test' })
} else {
    config()
}

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    DATABASE_CLIENT: z.enum(['sqlite3', 'pg']),
    DATABASE_URL: z.string(),
    PORT: z.coerce.number().default(3333),
})

const parsed = envSchema.safeParse(process.env)

if (parsed.success === false) {
    console.error('⚠︎ Invalid environment variables!', parsed.error.format)
    throw new Error('Invalid environment variables')
}

export const env = parsed.data
