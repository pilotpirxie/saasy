import {CacheStore} from '../data/cacheStore';
import {PrismaClient} from '@prisma/client';
import {FastifyPluginAsyncTypebox, Type} from '@fastify/type-provider-typebox';

export default function getBasicController({
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
}): FastifyPluginAsyncTypebox {
  return async (fastify) => {
    fastify.get('/:userId', {
      schema: {
        params: Type.Object({
          userId: Type.String({
            format: 'uuid'
          })
        })
      }
    }, async (request, reply) => {
      const {userId} = request.params;
      return prisma.users.findMany({
        where: {
          id: userId
        }
      });
    });
  };
}