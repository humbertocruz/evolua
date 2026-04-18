import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const from = process.env.RESEND_FROM || 'onboarding@resend.dev';
    
    await resend.emails.send({
      from: from,
      to: email,
      subject: 'Authorize your new device - envware 🌸',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 10px;">
          <h1 style="color: #d946ef;">envware 🌸</h1>
          <p>Hello!</p>
          <p>A new device is trying to access your envware projects. To authorize it, please use the following verification code in your terminal:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999;">Securely sync encrypted secrets across your devices.</p>
        </div>
      `,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
}
