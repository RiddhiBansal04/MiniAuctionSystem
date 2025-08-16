import sg from '@sendgrid/mail';
import { config } from '../config.js';

sg.setApiKey(config.sendgridKey);

export async function sendEmail({ to, subject, text, html, attachments }) {
  if (!config.sendgridKey) return;
  await sg.send({ to, from: config.emailFrom, subject, text, html, attachments });
}
