const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query'], // Enable logging for queries, info, warnings, and errors
});

// Export the Prisma Client instance
module.exports = prisma;

