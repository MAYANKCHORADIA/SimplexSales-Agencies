// Notify utilities: use SendGrid for email and Twilio for SMS when configured.
// Falls back to console logging when provider credentials are missing.

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const TWILIO_ACCOUNT = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;

export async function sendEmail(to, subject, text) {
  if (SENDGRID_KEY) {
    try {
      const sgMail = (await import('@sendgrid/mail')).default;
      sgMail.setApiKey(SENDGRID_KEY);
      const msg = {
        to,
        from: process.env.SENDGRID_FROM || 'no-reply@example.com',
        subject,
        text,
      };
      const res = await sgMail.send(msg);
      return res;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('SendGrid send error:', err);
      // fallthrough to console fallback
    }
  }

  // fallback
  // eslint-disable-next-line no-console
  console.log(`[notify] sendEmail -> to: ${to}, subject: ${subject}, text: ${text}`);
  return { ok: true, fallback: true };
}

export async function sendSMS(phone, message) {
  if (TWILIO_ACCOUNT && TWILIO_TOKEN && TWILIO_FROM) {
    try {
      const twilio = await import('twilio');
      const client = twilio.default(TWILIO_ACCOUNT, TWILIO_TOKEN);
      const resp = await client.messages.create({ body: message, from: TWILIO_FROM, to: phone });
      return resp;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Twilio send error:', err);
      // fallthrough to console fallback
    }
  }

  // fallback
  // eslint-disable-next-line no-console
  console.log(`[notify] sendSMS -> phone: ${phone}, message: ${message}`);
  return { ok: true, fallback: true };
}

export default { sendEmail, sendSMS };
