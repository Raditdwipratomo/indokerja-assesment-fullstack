"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hash = await bcryptjs_1.default.hash('password123', 10);
    const seeker = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'seeker@example.com',
            passwordHash: hash,
            role: client_1.Role.JOB_SEEKER,
        },
    });
    const company = await prisma.user.create({
        data: {
            name: 'PT ABC Technology',
            email: 'company@example.com',
            passwordHash: hash,
            role: client_1.Role.COMPANY,
        },
    });
    const jobs = await Promise.all([
        prisma.job.create({
            data: {
                title: 'Frontend Developer',
                companyId: company.id,
                location: 'Jakarta',
                salary: 10000000,
                jobType: client_1.JobType.FULL_TIME,
            },
        }),
        prisma.job.create({
            data: {
                title: 'Backend Developer',
                companyId: company.id,
                location: 'Bandung',
                salary: 12000000,
                jobType: client_1.JobType.FULL_TIME,
            },
        }),
        prisma.job.create({
            data: {
                title: 'UI/UX Designer',
                companyId: company.id,
                location: 'Remote',
                salary: 8000000,
                jobType: client_1.JobType.CONTRACT,
            },
        }),
        prisma.job.create({
            data: {
                title: 'Data Analyst',
                companyId: company.id,
                location: 'Surabaya',
                salary: 9000000,
                jobType: client_1.JobType.PART_TIME,
            },
        }),
        prisma.job.create({
            data: {
                title: 'Marketing Intern',
                companyId: company.id,
                location: 'Jakarta',
                salary: 3000000,
                jobType: client_1.JobType.INTERNSHIP,
            },
        }),
    ]);
    const app1 = await prisma.application.create({
        data: {
            jobId: jobs[0].id,
            jobSeekerId: seeker.id,
            status: client_1.ApplicationStatus.APPLIED,
        },
    });
    await prisma.applicationHistory.create({
        data: {
            applicationId: app1.id,
            status: client_1.ApplicationStatus.APPLIED,
        },
    });
    const app2 = await prisma.application.create({
        data: {
            jobId: jobs[1].id,
            jobSeekerId: seeker.id,
            status: client_1.ApplicationStatus.APPLIED,
        },
    });
    await prisma.applicationHistory.create({
        data: {
            applicationId: app2.id,
            status: client_1.ApplicationStatus.APPLIED,
        },
    });
    console.log('Seed successful');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
