import dotenv from 'dotenv';
import NodeCache from 'node-cache';
import { checkPrismaConnection } from './data/prismaConnectionTest';
import { usePrismaClientFactory } from './data/prismaClientFactory';
import { NodeCacheAdapter } from './data/cacheStore';
import getBasicController from './controllers/basic';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';

dotenv.config();

const app = fastify({
  bodyLimit: Number(process.env.MAX_BODY_SIZE || 1024),
  logger: true
});

app.register(fastifyCors);

const prisma = usePrismaClientFactory({
  isDevelopment: process.env.NODE_ENV === 'development',
});

checkPrismaConnection(prisma);

const nodeCache = new NodeCache({
  stdTTL: 10,
  checkperiod: 1,
});

const cache = new NodeCacheAdapter({
  nodeCache,
});

app.get('/api/health', async (request, reply) => reply.status(200));

app.register(getBasicController({
  config: {
    jwtInfo: {
      secret: process.env.JWT_SECRET || '',
      refreshTokenTimeout: process.env.JWT_REFRESH_TOKEN_TIMEOUT || '1d',
      timeout: process.env.JWT_TIMEOUT || '1h',
    },
  },
  cache,
  prisma,
}), {
  prefix: '/api/basic',
});

app.setErrorHandler(function (error, request, reply) {
  if (error.statusCode && error.statusCode > 499) {
    this.log.error(error);
    reply.status(500);
    return {
      error: 'Internal Server Error',
    };
  } else {
    reply.status(error.statusCode || 500);
    return {
      error: error.message,
    };
  }
});

app.listen({
  port: Number(process.env.PORT || 3000),
}).then(() => {
  const address = app.server.address();
  const port = typeof address === 'string' ? address : address?.port;

  console.info({
    mode: process.env.NODE_ENV,
    sdk: process.version,
    datetime: new Date().toISOString(),
    service: process.env.SERVICE,
  });
  console.info(`Server is running on port ${port}`);

}).catch((error) => {
  console.error(error);
  process.exit(1);
});