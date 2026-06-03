export const mockJobs = [
  { id: 1, title: "Senior React Developer", company: "TechCorp", location: "Downtown, 0.5km away", salary: "$120k - $150k", type: "Full-time", posted: "2h ago", logo: "💻", tags: ["React", "TypeScript", "Remote"], rating: 4.8, applicants: 24 },
  { id: 2, title: "UX Designer", company: "DesignHub", location: "Creative District, 1.2km away", salary: "$90k - $110k", type: "Full-time", posted: "5h ago", logo: "🎨", tags: ["Figma", "UI/UX", "Prototyping"], rating: 4.6, applicants: 18 },
  { id: 3, title: "Backend Engineer", company: "DataSystems", location: "Tech Park, 2.1km away", salary: "$130k - $160k", type: "Full-time", posted: "1d ago", logo: "⚙️", tags: ["Node.js", "PostgreSQL", "AWS"], rating: 4.9, applicants: 32 },
  { id: 4, title: "Marketing Manager", company: "GrowthLabs", location: "Business Center, 0.8km away", salary: "$85k - $105k", type: "Full-time", posted: "3h ago", logo: "📈", tags: ["SEO", "Content", "Analytics"], rating: 4.5, applicants: 15 },
  { id: 5, title: "DevOps Engineer", company: "CloudNative", location: "Innovation Hub, 1.5km away", salary: "$140k - $170k", type: "Contract", posted: "4h ago", logo: "☁️", tags: ["Kubernetes", "Docker", "CI/CD"], rating: 4.7, applicants: 28 },
];

export const mockAnalytics = {
  totalJobs: 1247,
  totalWorkers: 8934,
  totalCompanies: 342,
  matchesToday: 156,
  weeklyStats: [45, 52, 48, 61, 55, 67, 72],
  monthlyStats: [320, 380, 420, 390, 450, 480, 520, 490, 550, 580, 620, 680]
};

export const filterTags = ['Remote', 'Full-time', 'Part-time', 'Contract', 'Entry Level', 'Senior', 'React', 'Python', 'Design'];

export const skillDemand = [
  { skill: 'React/Next.js', demand: 92 },
  { skill: 'Python/ML', demand: 88 },
  { skill: 'DevOps/K8s', demand: 85 },
  { skill: 'UI/UX Design', demand: 78 },
  { skill: 'Node.js', demand: 75 },
];

export const platformStats = [
  { label: 'Total Matches', value: '45.2K', icon: 'CheckCircle' },
  { label: 'Avg. Response Time', value: '2.4h', icon: 'Clock' },
  { label: 'Success Rate', value: '78%', icon: 'TrendingUp' },
  { label: 'Active Users', value: '12.8K', icon: 'Users' },
];

export const companyDistribution = [
  { industry: 'Technology', count: 142, color: 'from-blue-500 to-blue-700' },
  { industry: 'Creative', count: 89, color: 'from-purple-500 to-purple-700' },
  { industry: 'Business', count: 67, color: 'from-pink-500 to-pink-700' },
];

export const landingFeatures = [
  { title: "Location First", desc: "Find opportunities within walking distance or short commute" },
  { title: "Instant Matching", desc: "AI-powered matching connects you with perfect fits in seconds" },
  { title: "Verified Companies", desc: "All employers are vetted to ensure quality opportunities" },
];

export const workerFields = [
  { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'john@email.com' },
  { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 234 567 890' },
  { name: 'location', label: 'Your Location', type: 'text', placeholder: 'Downtown, New York' },
  { name: 'skills', label: 'Skills (comma separated)', type: 'text', placeholder: 'React, Node.js, Python' },
  { name: 'experience', label: 'Years of Experience', type: 'number', placeholder: '3' },
  { name: 'jobTitle', label: 'Desired Job Title', type: 'text', placeholder: 'Senior Developer' },
];

export const companyFields = [
  { name: 'companyName', label: 'Company Name', type: 'text', placeholder: 'TechCorp Inc.' },
  { name: 'email', label: 'Business Email', type: 'email', placeholder: 'hr@techcorp.com' },
  { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
  { name: 'phone', label: 'Company Phone', type: 'tel', placeholder: '+1 234 567 890' },
  { name: 'location', label: 'Office Location', type: 'text', placeholder: 'Downtown, New York' },
  { name: 'industry', label: 'Industry', type: 'text', placeholder: 'Software, Marketing, etc.' },
  { name: 'companySize', label: 'Company Size', type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  { name: 'website', label: 'Company Website', type: 'url', placeholder: 'https://techcorp.com' },
];