const DEFAULT_JOB_APPLICANT_MAIL_FROM =
  "Royale Hayat <noreply@royalehayat.com>";

/** Internal/notification mail (HR alerts, OTP, enquiries, etc.). */
export const getMailFromAddress = () =>
  process.env.MAIL_FROM?.trim() ||
  "Royal Hayat <royalehayat.dev@gmail.com>";

/** Job application confirmation to the applicant only. */
export const getJobApplicantMailFromAddress = () =>
  process.env.JOB_APPLICANT_MAIL_FROM?.trim() ||
  DEFAULT_JOB_APPLICANT_MAIL_FROM;
