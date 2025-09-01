// src/utils/emails.js
// => Stub para envio de e-mails (substituir por integração real)
export async function sendEmail({ to, subject, html }) {
  // Aqui você pode integrar com SES, SendGrid, Resend, etc.
  console.log('E-mail (stub) enviado para:', to, 'assunto:', subject);
  return true;
}
