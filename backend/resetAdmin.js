require('dotenv').config();
const sequelize = require('./config/db');
const Admin = require('./models/Admin');

async function resetAdmin() {
  try {
    await sequelize.sync();
    
    // Find or Create
    let admin = await Admin.findOne({ where: { email: 'admin@nearjob.dev' } });
    
    if (admin) {
      console.log('♻️ Resetting existing admin password...');
      admin.password = 'NearJob@Pyramid#2024';
      admin.isActive = true;
      admin.isSuperAdmin = true;
      await admin.save();
    } else {
      console.log('✨ Creating new admin...');
      admin = await Admin.create({
        email: 'admin@nearjob.dev',
        password: 'NearJob@Pyramid#2024',
        name: 'NearJob Administrator',
        adminType: 'developer',
        isSuperAdmin: true,
        isActive: true
      });
    }

    console.log('✅ Admin credentials set to:');
    console.log('   Email   : admin@nearjob.dev');
    console.log('   Password: NearJob@Pyramid#2024');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reset failed:', err);
    process.exit(1);
  }
}

resetAdmin();
