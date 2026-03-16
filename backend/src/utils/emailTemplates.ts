export const emailTemplates = {
  otpEmail: (email: string, otp: string) => `
    <h2>Verify your WeFixIt Account</h2>
    <p>Please click the link below to verify your account and set up your password.</p>
    <a href="http://localhost:3000/verify-account?email=${encodeURIComponent(email)}&otp=${otp}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Verify Account</a>
    <p>Alternatively, your OTP code is: <strong style="font-size: 1.2em;">${otp}</strong></p>
    <p>This verification link/code expires in 10 minutes.</p>
  `,

  welcomeEmail: (name: string) => `
    <h2>Welcome, ${name}! 🎉</h2>
    <p>Your account has been verified successfully. You can now log in.</p>
  `,

  resetPasswordEmail: (email: string, otp: string) => `
    <h2>Reset Your Password</h2>
    <p>Please click the link below to reset your password.</p>
    <a href="http://localhost:3000/reset-password?email=${encodeURIComponent(email)}&otp=${otp}" style="display:inline-block;padding:10px 20px;background:#dc3545;color:#fff;text-decoration:none;border-radius:5px;">Reset Password</a>
    <p>Alternatively, your OTP code is: <strong style="font-size: 1.2em;">${otp}</strong></p>
    <p>This link/code expires in 10 minutes.</p>
  `,
};
