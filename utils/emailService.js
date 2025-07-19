// utils/emailService.js - Email service utility
import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email configuration is available
      if (
        !process.env.EMAIL_HOST ||
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASS
      ) {
        console.warn(
          "Email configuration not found. Email services will be disabled."
        );
        return;
      }

      // Create transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      this.isConfigured = true;
      console.log("Email service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize email service:", error);
      this.isConfigured = false;
    }
  }

  // Send OTP email
  async sendOTPEmail(email, otp, purpose = "signup") {
    if (!this.isConfigured) {
      console.error("Email service not configured");
      return { success: false, message: "Email service not available" };
    }

    try {
      const subject = this.getSubjectByPurpose(purpose);
      const html = this.getOTPEmailTemplate(otp, purpose);

      const mailOptions = {
        from: `"BorrowMyCar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("OTP email sent successfully:", result.messageId);

      return {
        success: true,
        message: "OTP email sent successfully",
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      return {
        success: false,
        message: "Failed to send email",
        error: error.message,
      };
    }
  }

  // Send welcome email after verification
  async sendWelcomeEmail(email, name, role) {
    if (!this.isConfigured) {
      return { success: false, message: "Email service not available" };
    }

    try {
      const subject = "Welcome to BorrowMyCar! 🚗";
      const html = this.getWelcomeEmailTemplate(name, role);

      const mailOptions = {
        from: `"BorrowMyCar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Welcome email sent successfully:", result.messageId);

      return {
        success: true,
        message: "Welcome email sent successfully",
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      return {
        success: false,
        message: "Failed to send welcome email",
        error: error.message,
      };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, otp) {
    if (!this.isConfigured) {
      console.error("Email service not configured");
      return { success: false, message: "Email service not available" };
    }

    try {
      const subject = "Reset your password - BorrowMyCar";
      const html = this.getPasswordResetEmailTemplate(otp);

      const mailOptions = {
        from: `"BorrowMyCar" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Password reset email sent successfully:", result.messageId);

      return {
        success: true,
        message: "Password reset email sent successfully",
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return {
        success: false,
        message: "Failed to send password reset email",
        error: error.message,
      };
    }
  }

  // Get subject line based on purpose
  getSubjectByPurpose(purpose) {
    switch (purpose) {
      case "signup":
        return "Verify your email - BorrowMyCar";
      case "password-reset":
        return "Reset your password - BorrowMyCar";
      case "email-verification":
        return "Verify your email address - BorrowMyCar";
      default:
        return "Verification code - BorrowMyCar";
    }
  }

  // OTP email template
  getOTPEmailTemplate(otp, purpose) {
    const purposeText =
      purpose === "signup"
        ? "complete your registration"
        : "verify your identity";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #10b981; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fef3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚗 BorrowMyCar</h1>
                <p>Email Verification</p>
            </div>
            <div class="content">
                <h2>Hello!</h2>
                <p>Thank you for choosing BorrowMyCar. To ${purposeText}, please use the verification code below:</p>
                
                <div class="otp-box">
                    <p>Your verification code is:</p>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>This code will expire in 10 minutes</li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                </div>
                
                <p>If you have any questions, feel free to contact our support team.</p>
                
                <p>Best regards,<br>The BorrowMyCar Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>© 2024 BorrowMyCar. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Welcome email template
  getWelcomeEmailTemplate(name, role) {
    const roleText =
      role === "renter" ? "renting amazing cars" : "listing your car";
    const roleIcon = role === "renter" ? "🚗" : "🔑";

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BorrowMyCar</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }
            .welcome-box { background: white; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .feature { background: white; border-radius: 5px; padding: 15px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚗 BorrowMyCar</h1>
                <p>Welcome to the Community!</p>
            </div>
            <div class="content">
                <div class="welcome-box">
                    <h2>Welcome, ${name}! 🎉</h2>
                    <p>Your email has been verified successfully. You're now ready to start ${roleText}!</p>
                    <p style="font-size: 24px;">${roleIcon}</p>
                </div>
                
                <h3>What's Next?</h3>
                
                <div class="feature">
                    <strong>📧 Account Approval:</strong> Our team will review your documents within 24-48 hours and approve your account.
                </div>
                
                <div class="feature">
                    <strong>🔔 Notifications:</strong> You'll receive an email notification once your account is approved.
                </div>
                
                <div class="feature">
                    <strong>🚀 Get Started:</strong> Once approved, you can ${
                      role === "renter"
                        ? "browse and book cars"
                        : "list your car for rent"
                    }.
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${
                      process.env.FRONTEND_URL || "http://localhost:5173"
                    }/login" class="btn">
                        Sign In to Your Account
                    </a>
                </div>
                
                <p>If you have any questions, don't hesitate to reach out to our support team.</p>
                
                <p>Best regards,<br>The BorrowMyCar Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>© 2024 BorrowMyCar. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Password reset email template
  getPasswordResetEmailTemplate(otp) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #ef4444; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #ef4444; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fef3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .security-notice { background: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚗 BorrowMyCar</h1>
                <p>Password Reset Request</p>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password. To proceed with resetting your password, please use the verification code below:</p>
                
                <div class="otp-box">
                    <p>Your password reset code is:</p>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>This code will expire in 10 minutes</li>
                        <li>Do not share this code with anyone</li>
                        <li>Use this code to reset your password in the app</li>
                    </ul>
                </div>
                
                <div class="security-notice">
                    <strong>🔒 Security Notice:</strong>
                    <p>If you didn't request a password reset, please ignore this email. Your account remains secure and no changes have been made.</p>
                </div>
                
                <p>If you continue to have problems, feel free to contact our support team.</p>
                
                <p>Best regards,<br>The BorrowMyCar Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>© 2024 BorrowMyCar. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Test email configuration
  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, message: "Email service not configured" };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: "Email service is working correctly" };
    } catch (error) {
      return {
        success: false,
        message: "Email service connection failed",
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;
export { EmailService };
