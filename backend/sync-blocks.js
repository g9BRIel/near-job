const Conversation = require('./models/Conversation');
const Block = require('./models/Block');
const sequelize = require('./config/db');

async function cleanup() {
  try {
    console.log('--- STARTING BLOCK SYNCHRONIZATION ---');
    
    // 1. Find all global blocks
    const blocks = await Block.findAll();
    console.log(`Found ${blocks.length} global block records.`);

    for (const b of blocks) {
      const convWhere = b.blockerType === 'worker' 
        ? { workerId: b.blockerId, companyId: b.blockedId }
        : { workerId: b.blockedId, companyId: b.blockerId };

      const conv = await Conversation.findOne({ where: convWhere });
      if (conv) {
        let changed = false;
        if (b.blockerType === 'worker' && !conv.blockedByWorker) {
          conv.blockedByWorker = true;
          changed = true;
        } else if (b.blockerType === 'company' && !conv.blockedByCompany) {
          conv.blockedByCompany = true;
          changed = true;
        }
        
        if (changed) {
          await conv.save();
          console.log(`Updated conversation ${conv.id}: set blockedBy${b.blockerType === 'worker' ? 'Worker' : 'Company'} = true`);
        }
      }
    }

    // 2. Find conversations with block flags but NO global block (stale blocks)
    const convs = await Conversation.findAll();
    for (const c of convs) {
      if (c.blockedByWorker) {
          const exists = await Block.findOne({ where: { blockerId: c.workerId, blockerType: 'worker', blockedId: c.companyId, blockedType: 'company' }});
          if (!exists) {
              c.blockedByWorker = false;
              await c.save();
              console.log(`Fixed stale block in conversation ${c.id}: cleared blockedByWorker`);
          }
      }
      if (c.blockedByCompany) {
          const exists = await Block.findOne({ where: { blockerId: c.companyId, blockerType: 'company', blockedId: c.workerId, blockedType: 'worker' }});
          if (!exists) {
              c.blockedByCompany = false;
              await c.save();
              console.log(`Fixed stale block in conversation ${c.id}: cleared blockedByCompany`);
          }
      }
    }

    console.log('--- SYNC COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
