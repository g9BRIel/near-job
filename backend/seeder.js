const dotenv = require('dotenv');
const sequelize = require('./config/db');
const Worker = require('./models/Worker');
const Company = require('./models/Company');
const Job = require('./models/Job');

dotenv.config();

const mockJobs = [
  { title: 'Senior React Developer', companyName: 'TechCorp', location: 'Downtown, 0.5km away', salary: '$120k - $150k', type: 'Full-time', logo: '💻', tags: ['React', 'TypeScript', 'Remote'], rating: 4.8, applicants: 24 },
  { title: 'UX Designer', companyName: 'DesignHub', location: 'Creative District, 1.2km away', salary: '$90k - $110k', type: 'Full-time', logo: '🎨', tags: ['Figma', 'UI/UX', 'Prototyping'], rating: 4.6, applicants: 18 },
  { title: 'Backend Engineer', companyName: 'DataSystems', location: 'Tech Park, 2.1km away', salary: '$130k - $160k', type: 'Full-time', logo: '⚙️', tags: ['Node.js', 'PostgreSQL', 'AWS'], rating: 4.9, applicants: 32 },
];

const seedMockData = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced & cleared existing data.');

    const companyUser = await Company.create({
      email: 'hr@dummycompany.com',
      password: 'password123',
      companyName: 'NearJob Dummy Company',
      location: 'Downtown dummy',
      industry: 'Software',
      companySize: '51-200',
    });

    await Worker.create({
      email: 'worker@dummyworker.com',
      password: 'password123',
      fullName: 'John Doe',
      location: 'Uptown dummy',
      role: 'Frontend Dev',
      experience: '3 years',
    });

    console.log('Created Worker and Company dummy accounts (pass: password123)');

    const jobsToInsert = mockJobs.map((job) => ({
      ...job,
      companyId: companyUser.id,
    }));

    await Job.bulkCreate(jobsToInsert);
    console.log('Database seeded with mock jobs!');

    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedMockData();
