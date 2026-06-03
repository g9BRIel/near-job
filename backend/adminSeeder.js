/**
 * Admin Seeder - Creates the first super-admin
 * Run: node adminSeeder.js
 * 
 * ⚠️  Keep these credentials SECRET — this is your master key to the pyramid.
 */
require('dotenv').config();
const sequelize = require('./config/db');
require('./models/Admin');
const Admin = require('./models/Admin');

async function seedAdmin() {
  try {
    await sequelize.sync({ alter: true });

    // Check if super-admin already exists
    const existing = await Admin.findOne({ where: { isSuperAdmin: true } });
    if (existing) {
      console.log('✅ Super-admin already exists:', existing.email);
      console.log('   Name:', existing.name);
      console.log('   Type:', existing.adminType);
      process.exit(0);
    }

    // Create the root super-admin
    const superAdmin = await Admin.create({
      email: 'admin@nearjob.dev',          // 🔑 Change this to your email
      password: 'NearJob@Pyramid#2024',     // 🔑 Change this to a strong password
      name: 'NearJob Administrator',
      adminType: 'developer',
      isSuperAdmin: true,
      createdBy: null,
    });

    console.log('\n🏛️  ═══════════════════════════════════════════');
    console.log('   Super-Admin created successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('   Email   :', superAdmin.email);
    console.log('   Password: NearJob@Pyramid#2024');
    console.log('   Type    :', superAdmin.adminType);
    console.log('   ID      :', superAdmin.id);
    console.log('═══════════════════════════════════════════');
    console.log('⚠️  IMPORTANT: Delete this file after use!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error.message);
    process.exit(1);
  }
}

seedAdmin();
