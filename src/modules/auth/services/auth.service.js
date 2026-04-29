import ApiError from '../../../utils/ApiError.js';
import authRepository from '../repositories/auth.repository.js';
import nodemailer from 'nodemailer';

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 10);

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const getMailTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendOtpEmail = async (email, otp) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new ApiError(500, 'SMTP_USER or SMTP_PASS missing');
  }

  const looksLikePlaceholderPassword = ['your_password', 'password', 'changeme'].includes(
    String(process.env.SMTP_PASS).toLowerCase()
  );
  if (looksLikePlaceholderPassword) {
    throw new ApiError(500, 'SMTP_PASS is invalid. Use a Gmail App Password.');
  }

  try {
    const html = `
      <div style="margin:0;padding:0;background-color:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f6f7fb;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e8ef;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="background:#5a0f2f;padding:18px 24px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;line-height:1.3;">Royal Hayat Hospitals</h1>
                    <p style="margin:6px 0 0;color:#f2d8e3;font-size:12px;">Secure Admin Login Verification</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:26px 24px 20px;">
                    <p style="margin:0 0 12px;color:#222;font-size:14px;">Hello,</p>
                    <p style="margin:0 0 18px;color:#444;font-size:14px;line-height:1.6;">
                      Use the one-time password below to complete your login.
                    </p>
                    <div style="text-align:center;margin:18px 0 20px;">
                      <span style="display:inline-block;padding:12px 22px;border:1px dashed #8b1d4a;border-radius:10px;background:#fff6fa;color:#8b1d4a;font-size:30px;font-weight:700;letter-spacing:8px;">
                        ${otp}
                      </span>
                    </div>
                    <p style="margin:0 0 8px;color:#444;font-size:13px;line-height:1.6;">
                      This OTP will expire in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
                    </p>
                    <p style="margin:0;color:#666;font-size:12px;line-height:1.6;">
                      If you did not request this login, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 24px;background:#fafbff;border-top:1px solid #ececf2;">
                    <p style="margin:0;color:#7a7a88;font-size:11px;text-align:center;">
                      This is an automated message from Royal Hayat Hospitals.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    const transporter = getMailTransporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Royal Hayat Login OTP',
      text: `Your OTP for login is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
      html,
    });
  } catch (error) {
    if (error?.code === 'EAUTH') {
      throw new ApiError(500, 'SMTP authentication failed. Check Gmail App Password.');
    }
    throw new ApiError(500, `Failed to send OTP email: ${error?.message || 'Unknown mail error'}`);
  }
};

const authService = {
  register: async ({ name, email, password, role }) => {
    const existing = await authRepository.findByEmail(email);
    if (existing) throw new ApiError(409, 'Email already registered');

    const user = await authRepository.create({ name, email, password, role });
    return user;
  },

  login: async ({ email, password }) => {
    const user = await authService.validateUserCredentials({ email, password });
    await authService.sendOtp({ email: user.email });

    return { email: user.email };
  },

  validateUserCredentials: async ({ email, password }) => {
    console.log("validateUserCredentials", email, password);
    const user = await authRepository.findByEmail(email);
    if (!user) throw new ApiError(404, 'User not found');

    const isValid = await user.isPasswordCorrect(password);
    if (!isValid) throw new ApiError(401, 'Invalid credentials');

    return user;
  },

  sendOtp: async ({ email }) => {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new ApiError(404, 'User not found');

    const otpCode = createOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    await authRepository.upsertLoginOtp(user._id, user.email, otpCode, otpExpiresAt);
    await sendOtpEmail(user.email, otpCode);
    return { email: user.email };
  },

  verifyOtp: async ({ email, otp }) => {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new ApiError(404, 'User not found');

    const otpRecord = await authRepository.findLoginOtpByUser(user._id, user.email);
    if (!otpRecord) throw new ApiError(400, 'OTP not requested');
    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      throw new ApiError(400, 'OTP expired');
    }
    if (otpRecord.otp !== otp) throw new ApiError(401, 'Invalid OTP');

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await authRepository.updateRefreshToken(user._id, refreshToken);
    await authRepository.clearLoginOtpByUser(user._id, user.email);

    return { user, accessToken, refreshToken };
  },

  logout: async (userId) => {
    await authRepository.updateRefreshToken(userId, null);
  },
};

export default authService;
