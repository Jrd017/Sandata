require('dotenv').config({ quiet: true });

const { connectDatabase, disconnectDatabase } = require('../services/db');
const { seedAll } = require('../services/seedContent');

async function run() {
  await connectDatabase();
  await seedAll({ force: true });
  console.log('Seed complete');
  await disconnectDatabase();
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
