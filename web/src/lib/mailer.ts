import nodemailer, { type Transporter } from "nodemailer";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let cached: Transporter | null | undefined;

function envTransport(): Transporter | null {
  if (cached !== undefined) return cached;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) return (cached = null);
  const port = Number(SMTP_PORT);
  return (cached = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 8000,
    socketTimeout: 8000,
  }));
}

// Sends one plain-text email. Returns false (never throws) when SMTP is not configured, the address is invalid or sending fails.
// `transport` is only for tests.
export async function sendMail(msg: { to: string; subject: string; text: string }, transport?: Transporter): Promise<boolean> {
  const mailer = transport ?? envTransport();
  if (!mailer || !EMAIL.test(msg.to)) return false;
  try {
    await mailer.sendMail({ from: process.env.MAIL_FROM, ...msg });
    return true;
  } catch (error) {
    console.error("Mail failed", error);
    return false;
  }
}
