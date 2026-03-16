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

  statusUpdateEmail: (
    name: string,
    trackingId: string,
    status: string,
    notes?: string,
  ) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0046c0; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0;">WeFixIt Nepal</h2>
      </div>
      <div style="padding: 30px;">
        <h3 style="margin-top: 0; color: #222;">Repair Status Update</h3>
        <p>Hello <strong>${name}</strong>,</p>
        <p>There has been an update regarding your device repair request.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #0046c0; border-radius: 4px; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Tracking ID</p>
          <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; letter-spacing: 1px;">${trackingId}</p>
          
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">New Status</p>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #28a745;">${status}</p>
          
          ${
            notes
              ? `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
              <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Technician Notes:</p>
              <p style="margin: 0; font-size: 14px; font-style: italic;">"${notes}"</p>
            </div>
          `
              : ""
          }
        </div>

        <p style="line-height: 1.5;">You can track the full timeline of your repair by logging into your client dashboard and entering your Tracking ID.</p>
        <p style="margin-top: 30px;">Thank you for trusting,<br/><strong>The WeFixIt Team</strong></p>
      </div>
    </div>
  `,

  bookingCreatedEmail: (name: string, trackingId: string, deviceName: string) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0046c0; padding: 20px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0;">WeFixIt Nepal</h2>
      </div>
      <div style="padding: 30px;">
        <h3 style="margin-top: 0; color: #222;">Repair Booking Confirmed!</h3>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We have successfully received your repair request for your <strong>${deviceName}</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #0046c0; border-radius: 4px; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your Tracking ID</p>
          <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; letter-spacing: 1px; color: #0046c0;">${trackingId}</p>
          
          <p style="margin: 0; font-size: 14px; color: #666;">Please keep this Tracking ID safe. You can use it to check the live status of your repair on our website!</p>
        </div>

        <p style="line-height: 1.5;">Please drop off your device at our service center if you haven't already. Our technicians will begin diagnosing it shortly after receiving it.</p>
        <p style="margin-top: 30px;">Thank you for trusting,<br/><strong>The WeFixIt Team</strong></p>
      </div>
    </div>
  `,
};
