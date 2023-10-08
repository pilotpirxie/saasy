export type EmailTarget = {
  to: string;
  subject: string;
}

export type EmailContent = {
  text?: string;
  html?: string;
}

export type EmailOptions = EmailTarget & EmailContent;

export interface EmailService {
  sendEmail(options: EmailOptions): void;
}
