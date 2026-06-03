const sequelize = require('./config/db');

async function fix() {
  try {
    await sequelize.query("ALTER TABLE Workers ADD COLUMN IF NOT EXISTS isVerified BOOLEAN DEFAULT FALSE;").catch(e=>console.log('isVerified worker fail'));
    await sequelize.query("ALTER TABLE Companies ADD COLUMN IF NOT EXISTS isVerified BOOLEAN DEFAULT FALSE;").catch(e=>console.log('isVerified company fail'));
    await sequelize.query("ALTER TABLE Workers ADD COLUMN IF NOT EXISTS latitude FLOAT;").catch(e=>console.log('lat worker fail'));
    await sequelize.query("ALTER TABLE Workers ADD COLUMN IF NOT EXISTS longitude FLOAT;").catch(e=>console.log('lng worker fail'));
    await sequelize.query("ALTER TABLE Companies ADD COLUMN IF NOT EXISTS latitude FLOAT;").catch(e=>console.log('lat company fail'));
    await sequelize.query("ALTER TABLE Companies ADD COLUMN IF NOT EXISTS longitude FLOAT;").catch(e=>console.log('lng company fail'));
    await sequelize.query("ALTER TABLE Workers ADD COLUMN IF NOT EXISTS lastActiveAt DATETIME DEFAULT CURRENT_TIMESTAMP;").catch(e=>console.log('lastActiveAt worker exists or fail'));
    await sequelize.query("ALTER TABLE Companies ADD COLUMN IF NOT EXISTS lastActiveAt DATETIME DEFAULT CURRENT_TIMESTAMP;").catch(e=>console.log('lastActiveAt company exists or fail'));
    await sequelize.query("ALTER TABLE Conversations ADD COLUMN IF NOT EXISTS blockedByWorker BOOLEAN DEFAULT FALSE;").catch(e=>console.log('blockedByWorker exists or fail'));
    await sequelize.query("ALTER TABLE Conversations ADD COLUMN IF NOT EXISTS blockedByCompany BOOLEAN DEFAULT FALSE;").catch(e=>console.log('blockedByCompany exists or fail'));
    
    // Aggressive fix for user_settings table
    console.log('Repairing user_settings table...');
    await sequelize.query("DROP TABLE IF EXISTS user_settings;").catch(e=>console.log('Drop fail:', e.message));
    
    await sequelize.query(`
      CREATE TABLE user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        userType VARCHAR(255) NOT NULL,
        theme VARCHAR(255) DEFAULT 'dark',
        notifications_email BOOLEAN DEFAULT TRUE,
        notifications_inApp BOOLEAN DEFAULT TRUE,
        notifications_messages BOOLEAN DEFAULT TRUE,
        notifications_jobs BOOLEAN DEFAULT TRUE,
        privacy_profileVisible BOOLEAN DEFAULT TRUE,
        privacy_allowMessages BOOLEAN DEFAULT TRUE,
        privacy_searchable BOOLEAN DEFAULT TRUE,
        preferences_language VARCHAR(255) DEFAULT 'en',
        preferences_emailFrequency VARCHAR(255) DEFAULT 'weekly',
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        UNIQUE KEY user_settings_unique_idx (userId, userType)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('DB Fields Sync Complete!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
