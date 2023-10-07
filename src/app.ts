import express, { Express } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import NodeCache from 'node-cache';
import cors from 'cors';
import { errorHandler } from './middlewares/errors';
import { checkPrismaConnection } from './data/prismaConnectionTest';
import { usePrismaClientFactory } from './data/prismaClientFactory';
import { NodeCacheAdapter } from './data/cacheStore';
import getBasicController from './controllers/basic';

dotenv.config();

const port = process.env.PORT || 3000;
const app: Express = express();

app.set('trust proxy', true);
app.disable('x-powered-by');

app.use(bodyParser.json({ limit: process.env.MAX_BODY_SIZE || '1KB' }));
app.use(cors());
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

app.get('/api/health', async (req, res) => res.sendStatus(200));

app.use(getBasicController({
  config: {
    jwtInfo: {
      secret: process.env.JWT_SECRET || '',
      refreshTokenTimeout: process.env.JWT_REFRESH_TOKEN_TIMEOUT || '1d',
      timeout: process.env.JWT_TIMEOUT || '1h',
    },
  },
  cache,
  prisma,
}));  


app.use(errorHandler);

app.listen(port, () => {
  console.info({
    mode: process.env.NODE_ENV,
    sdk: process.version,
    datetime: new Date().toISOString(),
    service: process.env.SERVICE,
  });
  console.info(`Server is running on port ${port}`);
});