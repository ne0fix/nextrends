import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.warn('Seeding dev database...');

  const org = await prisma.organization.upsert({
    where: { id: 'org_dev_001' },
    update: {},
    create: {
      id: 'org_dev_001',
      name: 'NextFace Demo',
      plan: 'PRO',
    },
  });

  console.warn('Seeded organization:', org.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
