import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';

import { env } from './config/env.js';
import { closeDb } from './db/client.js';
import { createProfileRepository } from './modules/profile/profileRepository.js';
import { appRouter } from './trpc/router.js';
import { createTrpcContext } from './trpc/trpc.js';

const app = Fastify({ logger: true });
const profileRepository = createProfileRepository();

app.get('/health', async () => ({ status: 'ok' }));

app.addHook('onClose', async () => {
  await closeDb();
});

const start = async (): Promise<void> => {
  try {
    await app.register(cors, {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    });

    await app.register(fastifyTRPCPlugin, {
      prefix: '/trpc',
      trpcOptions: {
        router: appRouter,
        createContext: ({ req, res }: { req: FastifyRequest; res: FastifyReply }) => createTrpcContext({
          profileRepository,
          req,
          res,
        }),
        onError: ({ error, path }: { error: unknown; path?: string }) => {
          app.log.error({ error, path }, 'tRPC request failed');
        },
      },
    });

    await app.listen({ host: env.HOST, port: env.PORT });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
