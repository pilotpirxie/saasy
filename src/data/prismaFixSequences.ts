import { PrismaClient } from '@prisma/client';

type TableListQuery = {
  table_name: string;
}[]

export const prismaFixSequences = async ({
  prisma,
  blacklist,
}: {
  prisma: PrismaClient;
  blacklist: string[];
}) => {
  const tableList = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';` as TableListQuery;
  const processed = [];

  for (let i = 0; i < tableList.length; i += 1) {
    if (blacklist.includes(tableList[i].table_name)) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const tableName = tableList[i].table_name;
    const query = `SELECT pg_catalog.setval(pg_get_serial_sequence('${tableName}', 'id'), MAX(id)) FROM ${tableName}`;
    await prisma.$executeRawUnsafe(query);
    processed.push(tableName);
  }

  return processed;
};
