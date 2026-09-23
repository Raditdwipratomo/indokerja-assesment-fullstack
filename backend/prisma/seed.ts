import { PrismaClient, Role, JobType, ApplicationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IndoKerja.id database with comprehensive demo data...');
  const hash = await bcrypt.hash('password123', 10);

  // 1. Create or update Demo Users
  const seeker1 = await prisma.user.upsert({
    where: { email: 'seeker@example.com' },
    update: { passwordHash: hash },
    create: {
      name: 'John Doe',
      email: 'seeker@example.com',
      passwordHash: hash,
      role: Role.JOB_SEEKER,
    },
  });

  const seeker2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: { passwordHash: hash },
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash: hash,
      role: Role.JOB_SEEKER,
    },
  });

  const company1 = await prisma.user.upsert({
    where: { email: 'company@example.com' },
    update: { passwordHash: hash },
    create: {
      name: 'PT ABC Technology',
      email: 'company@example.com',
      passwordHash: hash,
      role: Role.COMPANY,
    },
  });

  const company2 = await prisma.user.upsert({
    where: { email: 'digital@example.com' },
    update: { passwordHash: hash },
    create: {
      name: 'PT Nusantara Digital Inovasi',
      email: 'digital@example.com',
      passwordHash: hash,
      role: Role.COMPANY,
    },
  });

  console.log('Demo users ready.');

  // 2. Clear previous jobs & applications for clean seed
  await prisma.applicationHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();

  // 3. Create Sample Jobs for Company 1 (PT ABC Technology)
  const job1 = await prisma.job.create({
    data: {
      title: 'Frontend Developer (React & TypeScript)',
      companyId: company1.id,
      location: 'Jakarta Selatan',
      salary: 11000000,
      jobType: JobType.FULL_TIME,
      description: 'We are seeking a talented Frontend Engineer proficient in React, TypeScript, and modern styling libraries (Tailwind CSS, shadcn/ui). You will collaborate closely with UI/UX designers and backend developers to build intuitive web applications.',
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Senior Backend Engineer (Node.js & PostgreSQL)',
      companyId: company1.id,
      location: 'Bandung',
      salary: 16000000,
      jobType: JobType.FULL_TIME,
      description: 'Join our core platform engineering team to architect robust RESTful APIs, optimize PostgreSQL database queries, and design scalable microservices using Node.js, Express, and Prisma ORM.',
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'UI/UX Product Designer',
      companyId: company1.id,
      location: 'Remote (Indonesia)',
      salary: 9500000,
      jobType: JobType.CONTRACT,
      description: 'Responsible for conducting user research, creating wireframes, high-fidelity prototypes in Figma, and maintaining our design system component library.',
    },
  });

  const job4 = await prisma.job.create({
    data: {
      title: 'Data Analyst',
      companyId: company1.id,
      location: 'Surabaya',
      salary: 8500000,
      jobType: JobType.PART_TIME,
      description: 'Analyze user behavior data, build visualization dashboards in Metabase/Tableau, and provide actionable business insights to product managers.',
    },
  });

  const job5 = await prisma.job.create({
    data: {
      title: 'Software Quality Assurance Intern',
      companyId: company1.id,
      location: 'Jakarta Pusat',
      salary: 3500000,
      jobType: JobType.INTERNSHIP,
      description: 'Great opportunity for fresh graduates! Learn automated and manual testing methodologies, write API test scripts, and collaborate in agile sprints.',
    },
  });

  // 4. Create Sample Jobs for Company 2 (PT Nusantara Digital Inovasi)
  const job6 = await prisma.job.create({
    data: {
      title: 'DevOps & Cloud Infrastructure Engineer',
      companyId: company2.id,
      location: 'Jakarta Barat',
      salary: 18000000,
      jobType: JobType.FULL_TIME,
      description: 'Manage AWS & GCP cloud environments, setup CI/CD deployment pipelines with GitHub Actions, and monitor system reliability using Prometheus and Grafana.',
    },
  });

  const job7 = await prisma.job.create({
    data: {
      title: 'Mobile App Developer (Flutter)',
      companyId: company2.id,
      location: 'Yogyakarta / Remote',
      salary: 12500000,
      jobType: JobType.FULL_TIME,
      description: 'Develop and maintain cross-platform iOS and Android mobile applications using Flutter and Dart.',
    },
  });

  console.log('Demo jobs created.');

  // 5. Create Sample Applications with realistic ApplicationHistory records

  // Application 1: John Doe applied to Frontend Developer -> Progressed to SHORTLISTED
  const app1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      jobSeekerId: seeker1.id,
      status: ApplicationStatus.SHORTLISTED,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });
  await prisma.applicationHistory.createMany({
    data: [
      {
        applicationId: app1.id,
        status: ApplicationStatus.APPLIED,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: app1.id,
        status: ApplicationStatus.REVIEWING,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: app1.id,
        status: ApplicationStatus.SHORTLISTED,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Application 2: John Doe applied to Backend Developer -> Status APPLIED
  const app2 = await prisma.application.create({
    data: {
      jobId: job2.id,
      jobSeekerId: seeker1.id,
      status: ApplicationStatus.APPLIED,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.applicationHistory.create({
    data: {
      applicationId: app2.id,
      status: ApplicationStatus.APPLIED,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Application 3: Jane Smith applied to Frontend Developer -> Status ACCEPTED
  const app3 = await prisma.application.create({
    data: {
      jobId: job1.id,
      jobSeekerId: seeker2.id,
      status: ApplicationStatus.ACCEPTED,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.applicationHistory.createMany({
    data: [
      {
        applicationId: app3.id,
        status: ApplicationStatus.APPLIED,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: app3.id,
        status: ApplicationStatus.REVIEWING,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: app3.id,
        status: ApplicationStatus.SHORTLISTED,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: app3.id,
        status: ApplicationStatus.ACCEPTED,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ],
  });

  // Application 4: Jane Smith applied to DevOps -> Status REVIEWING
  const app4 = await prisma.application.create({
    data: {
      jobId: job6.id,
      jobSeekerId: seeker2.id,
      status: ApplicationStatus.REVIEWING,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.applicationHistory.createMany({
    data: [
      {
        applicationId: app4.id,
        status: ApplicationStatus.APPLIED,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        applicationId: app4.id,
        status: ApplicationStatus.REVIEWING,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('Demo applications and history timeline created successfully!');
  console.log('\nSeeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
