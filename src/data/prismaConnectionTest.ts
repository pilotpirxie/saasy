import { PrismaClient } from '@prisma/client';

export function checkPrismaConnection(prisma: PrismaClient) {
  prisma.$queryRaw`SELECT 1+1 as connection_test`.then((response) => {
    const data = response as {connection_test: number; }[];
    console.info(data);
    if (data[0].connection_test !== 2) {
      console.error('Database connection error');
      process.exit(1);
    }
    console.info('Successfully connected to database');
  }).catch((err) => {
    console.error('Database connection error', err);
    process.exit(1);
  });
}
