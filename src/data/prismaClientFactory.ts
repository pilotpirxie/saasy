import {Prisma, PrismaClient} from '@prisma/client';

export function usePrismaClientFactory({ isDevelopment }: {isDevelopment: boolean}): PrismaClient {
  if (isDevelopment) {
    const prisma = new PrismaClient({
      log: [{
        emit: 'event',
        level: 'query',
      }, 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
    prisma.$on('query', (e: Prisma.QueryEvent) => {
      console.info(e.timestamp, e.query, e.params, `${e.duration}ms`);
    });
    return prisma;
  }

  return new PrismaClient({
    log: ['info', 'warn', 'error'],
    errorFormat: 'pretty',
  });
}
