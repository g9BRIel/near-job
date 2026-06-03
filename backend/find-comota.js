const sequelize = require('./config/db');
const Worker = require('./models/Worker');
const Company = require('./models/Company');
const { Op } = require('sequelize');

async function findComota() {
  try {
    const workers = await Worker.findAll({
      where: {
        [Op.or]: [
          { fullName: { [Op.like]: '%comota%' } },
          { email: { [Op.like]: '%comota%' } }
        ]
      }
    });

    const companies = await Company.findAll({
      where: {
        [Op.or]: [
          { companyName: { [Op.like]: '%comota%' } },
          { email: { [Op.like]: '%comota%' } }
        ]
      }
    });

    console.log('--- WORKERS ---');
    workers.forEach(w => console.log(`ID: ${w.id}, Name: ${w.fullName}, Email: ${w.email}`));
    
    console.log('--- COMPANIES ---');
    companies.forEach(c => console.log(`ID: ${c.id}, Name: ${c.companyName}, Email: ${c.email}`));

  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

findComota();
