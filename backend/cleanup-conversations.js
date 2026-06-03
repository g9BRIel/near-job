const sequelize = require('./config/db');
const Conversation = require('./models/Conversation');

async function cleanup() {
  try {
    await sequelize.authenticate();
    const all = await Conversation.findAll();
    const seen = new Set();
    const duplicates = [];

    for (const c of all) {
      const key = `${c.workerId}-${c.companyId}`;
      if (seen.has(key)) {
        duplicates.push(c.id);
      } else {
        seen.add(key);
      }
    }

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate conversations. Deleting IDs: ${duplicates.join(', ')}`);
      await Conversation.destroy({ where: { id: duplicates } });
      console.log('Cleanup complete.');
    } else {
      console.log('No duplicate conversations found.');
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

cleanup();
