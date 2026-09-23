import { app } from './app';
import { Server } from 'http';

let server: Server;
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}/api`;

async function req(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    // not json
  }
  return { status: res.status, data };
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}...`);
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, testName: string, detail?: any) => {
      if (condition) {
        console.log(` PASS: ${testName}`);
        passed++;
      } else {
        console.error(` FAIL: ${testName}`, detail || '');
        failed++;
      }
    };

    try {
      // 1. Health check
      const healthRes = await req('/health');
      assert(healthRes.status === 200 && healthRes.data?.status === 'ok', 'Health Check');

      // 2. Login Job Seeker
      const seekerLoginRes = await req('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'seeker@example.com',
          password: 'password123',
        }),
      });
      assert(
        seekerLoginRes.status === 200 &&
          seekerLoginRes.data?.data?.token &&
          seekerLoginRes.data?.data?.user?.role === 'JOB_SEEKER',
        'Job Seeker Login'
      );
      const seekerToken = seekerLoginRes.data?.data?.token;
      const seekerHeaders = { Authorization: `Bearer ${seekerToken}` };

      // 3. Login Company
      const companyLoginRes = await req('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'company@example.com',
          password: 'password123',
        }),
      });
      assert(
        companyLoginRes.status === 200 &&
          companyLoginRes.data?.data?.token &&
          companyLoginRes.data?.data?.user?.role === 'COMPANY',
        'Company Login'
      );
      const companyToken = companyLoginRes.data?.data?.token;
      const companyHeaders = { Authorization: `Bearer ${companyToken}` };

      // 4. GET /api/auth/me
      const meRes = await req('/auth/me', { headers: seekerHeaders });
      assert(meRes.status === 200 && meRes.data?.data?.email === 'seeker@example.com', 'GET /auth/me for Seeker');

      // 5. GET /api/jobs (public / all)
      const jobsRes = await req('/jobs');
      assert(jobsRes.status === 200 && Array.isArray(jobsRes.data?.data) && jobsRes.data.data.length > 0, 'GET /jobs List');
      const allJobs = jobsRes.data.data;
      const firstJob = allJobs[0];

      // 6. GET /api/jobs with Search
      const searchRes = await req(`/jobs?search=${encodeURIComponent(firstJob.title)}`);
      assert(searchRes.status === 200 && searchRes.data?.data?.length > 0, 'GET /jobs with search query');

      // 7. GET /api/jobs/:id (Detail)
      const jobDetailRes = await req(`/jobs/${firstJob.id}`);
      assert(jobDetailRes.status === 200 && jobDetailRes.data?.data?.id === firstJob.id, 'GET /jobs/:id Detail');

      // 8. Company creates job
      const newJobPayload = {
        title: `DevOps Architect ${Date.now()}`,
        location: 'Jakarta',
        salary: 18000000,
        jobType: 'FULL_TIME',
        description: 'Manage and scale cloud infrastructure on AWS and Kubernetes.',
      };
      const createJobRes = await req('/jobs', {
        method: 'POST',
        headers: companyHeaders,
        body: JSON.stringify(newJobPayload),
      });
      assert(createJobRes.status === 201 && createJobRes.data?.data?.title === newJobPayload.title, 'Company POST /jobs');
      const createdJob = createJobRes.data?.data;

      // 9. Authorization check: Job Seeker cannot create job
      const seekerCreateJobRes = await req('/jobs', {
        method: 'POST',
        headers: seekerHeaders,
        body: JSON.stringify(newJobPayload),
      });
      assert(seekerCreateJobRes.status === 403, 'Job Seeker POST /jobs returns 403 Forbidden');

      // 10. GET /api/jobs/my (Company only)
      const myJobsRes = await req('/jobs/my', { headers: companyHeaders });
      assert(myJobsRes.status === 200 && Array.isArray(myJobsRes.data?.data), 'Company GET /jobs/my');

      // 11. Job Seeker applies to the newly created job
      const applyRes = await req('/applications', {
        method: 'POST',
        headers: seekerHeaders,
        body: JSON.stringify({ jobId: createdJob.id }),
      });
      assert(
        applyRes.status === 201 &&
          applyRes.data?.data?.status === 'APPLIED',
        'Job Seeker Apply (Status = APPLIED)'
      );
      const newApp = applyRes.data?.data;

      // 12. Duplicate apply prevention: Job Seeker tries to apply again to the same job
      const duplicateApplyRes = await req('/applications', {
        method: 'POST',
        headers: seekerHeaders,
        body: JSON.stringify({ jobId: createdJob.id }),
      });
      assert(
        duplicateApplyRes.status === 409,
        'Duplicate Apply returns 409 Conflict',
        duplicateApplyRes.data
      );

      // 13. Job Seeker views My Applications
      const myAppsRes = await req('/applications/me', { headers: seekerHeaders });
      assert(
        myAppsRes.status === 200 &&
          Array.isArray(myAppsRes.data?.data) &&
          myAppsRes.data.data.some((a: any) => a.id === newApp.id),
        'Job Seeker GET /applications/me'
      );

      // 14. Company views applicants for their job
      const applicantsRes = await req(`/jobs/${createdJob.id}/applications`, { headers: companyHeaders });
      assert(
        applicantsRes.status === 200 &&
          Array.isArray(applicantsRes.data?.data) &&
          applicantsRes.data.data.some((a: any) => a.id === newApp.id),
        'Company views applicants for owned job'
      );

      // 15. Company updates candidate status to REVIEWING
      const updateStatusRes = await req(`/applications/${newApp.id}/status`, {
        method: 'PATCH',
        headers: companyHeaders,
        body: JSON.stringify({ status: 'REVIEWING' }),
      });
      assert(
        updateStatusRes.status === 200 &&
          updateStatusRes.data?.data?.status === 'REVIEWING',
        'Company updates application status to REVIEWING'
      );

      // 16. Company updates candidate status to SHORTLISTED
      const updateStatusRes2 = await req(`/applications/${newApp.id}/status`, {
        method: 'PATCH',
        headers: companyHeaders,
        body: JSON.stringify({ status: 'SHORTLISTED' }),
      });
      assert(
        updateStatusRes2.status === 200 &&
          updateStatusRes2.data?.data?.status === 'SHORTLISTED',
        'Company updates application status to SHORTLISTED'
      );

      // 17. Verify Application History has APPLIED, REVIEWING, SHORTLISTED in order
      const historyRes = await req(`/applications/${newApp.id}/history`, { headers: seekerHeaders });
      assert(
        historyRes.status === 200 &&
          Array.isArray(historyRes.data?.data) &&
          historyRes.data.data.length >= 3 &&
          historyRes.data.data[0].status === 'SHORTLISTED' &&
          historyRes.data.data[1].status === 'REVIEWING' &&
          historyRes.data.data[2].status === 'APPLIED',
        'Application History records timeline accurately'
      );

      // 18. Authorization check: Job Seeker cannot update application status
      const seekerUpdateStatusRes = await req(`/applications/${newApp.id}/status`, {
        method: 'PATCH',
        headers: seekerHeaders,
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });
      assert(seekerUpdateStatusRes.status === 403, 'Job Seeker updating status returns 403 Forbidden');

      console.log(`\n================================`);
      console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
      console.log(`================================`);
    } catch (e) {
      console.error('Test execution error:', e);
    } finally {
      server.close();
      process.exit(failed > 0 ? 1 : 0);
    }
  });
}

runTests();
