import {CacheStore} from '../data/cacheStore';
import {PrismaClient} from '@prisma/client';
import {Router} from 'express';

export default function getBasicController(
  {
    config,
    cache,
    prisma,
  } : {
  config: {
    jwtInfo: {
      secret: string,
        refreshTokenTimeout: string
        timeout: string
    },
  },
  cache: CacheStore,
  prisma: PrismaClient,
}): Router{
  const router = Router();

  router.get('/', async (req, res, next) => {
    // ...
  });

  return router;
}