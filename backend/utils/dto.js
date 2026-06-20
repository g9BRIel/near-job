/**
 * dto.js — Data Transfer Object / Response Sanitization Layer
 *
 * All API responses for user data MUST pass through these functions.
 * This prevents sensitive field leakage (passwords, tokens, internal IDs, etc.)
 *
 * OWASP A02: Cryptographic Failures / Sensitive Data Exposure — Mitigated.
*/
const workerPublicDTO = (worker) => {
  if (!worker) return null;
  const w = worker.toJSON ? worker.toJSON() : { ...worker };
  return {
    id:         w.id,
    fullName:   w.fullName,
    jobTitle:   w.jobTitle,
    location:   w.location,
    skills:     w.skills,
    bio:        w.bio,
    avatar:     w.avatar,
    rating:     w.rating,
    ratingCount:w.ratingCount,
    isVerified: w.isVerified,
    lastActiveAt: w.lastActiveAt,
    userType:   'worker',
  };
};

/**
 * Private profile: shown only to the authenticated worker (their own data).
 * Includes more fields but NEVER includes password/reset tokens.
 */
const workerPrivateDTO = (worker) => {
  if (!worker) return null;
  const w = worker.toJSON ? worker.toJSON() : { ...worker };
  return {
    id:          w.id,
    email:       w.email,
    fullName:    w.fullName,
    phone:       w.phone,
    location:    w.location,
    latitude:    w.latitude,
    longitude:   w.longitude,
    role:        w.role,
    experience:  w.experience,
    jobTitle:    w.jobTitle,
    skills:      w.skills,
    bio:         w.bio,
    avatar:      w.avatar,
    cv:          w.cv,
    rating:      w.rating,
    ratingCount: w.ratingCount,
    isVerified:  w.isVerified,
    isBanned:    w.isBanned,
    isActive:    w.isActive,
    settings:    w.settings,
    lastActiveAt:w.lastActiveAt,
    createdAt:   w.createdAt,
    userType:    'worker',
  };
};

const companyPublicDTO = (company) => {
  if (!company) return null;
  const c = company.toJSON ? company.toJSON() : { ...company };
  return {
    id:          c.id,
    companyName: c.companyName,
    industry:    c.industry,
    companySize: c.companySize,
    location:    c.location,
    latitude:    c.latitude,
    longitude:   c.longitude,
    website:     c.website,
    logo:        c.logo,
    bio:         c.bio,
    rating:      c.rating,
    ratingCount: c.ratingCount,
    isVerified:  c.isVerified,
    lastActiveAt:c.lastActiveAt,
    userType:    'company',
  };
};

const companyPrivateDTO = (company) => {
  if (!company) return null;
  const c = company.toJSON ? company.toJSON() : { ...company };
  return {
    id:          c.id,
    email:       c.email,
    companyName: c.companyName,
    phone:       c.phone,
    location:    c.location,
    latitude:    c.latitude,
    longitude:   c.longitude,
    industry:    c.industry,
    companySize: c.companySize,
    website:     c.website,
    logo:        c.logo,
    bio:         c.bio,
    rating:      c.rating,
    ratingCount: c.ratingCount,
    isVerified:  c.isVerified,
    isBanned:    c.isBanned,
    isActive:    c.isActive,
    settings:    c.settings,
    lastActiveAt:c.lastActiveAt,
    createdAt:   c.createdAt,
    userType:    'company',
  };
};

const jobDTO = (job, extras = {}) => {
  if (!job) return null;
  const j = job.toJSON ? job.toJSON() : { ...job };
  return {
    id:          j.id,
    title:       j.title,
    description: j.description,
    location:    j.location,
    salary:      j.salary,
    type:        j.type,
    category:    j.category,
    skills:      j.skills,
    companyId:   j.companyId,
    companyName: j.companyName,
    logo:        j.logo,
    applicants:  j.applicants,
    companyUser: j.companyUser ? companyPublicDTO(j.companyUser) : undefined,
    createdAt:   j.createdAt,
    ...extras,   // e.g. isApplied
  };
};

// ─── Auth Response DTO ────────────────────────────────────────────────────────
// Used in login / register responses
const authResponseDTO = (account, userType, token) => ({
  token,
  id:       account.id,
  userType,
  email:    account.email,
  profile:  userType === 'worker'
    ? workerPrivateDTO(account)
    : companyPrivateDTO(account),
});

// ─── Application DTO ──────────────────────────────────────────────────────────
const applicationDTO = (app) => {
  if (!app) return null;
  const a = app.toJSON ? app.toJSON() : { ...app };
  return {
    id:          a.id,
    jobId:       a.jobId,
    workerId:    a.workerId,
    status:      a.status,
    coverLetter: a.coverLetter,
    // Expose resume link but not raw base64 in list views
    hasResume:   !!a.resume,
    createdAt:   a.createdAt,
    job:         a.job     ? jobDTO(a.job)                  : undefined,
    worker:      a.worker  ? workerPublicDTO(a.worker)      : undefined,
  };
};

module.exports = {
  workerPublicDTO,
  workerPrivateDTO,
  companyPublicDTO,
  companyPrivateDTO,
  jobDTO,
  authResponseDTO,
  applicationDTO,
};
