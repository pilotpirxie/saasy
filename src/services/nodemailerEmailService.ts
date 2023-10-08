import nodemailer from "nodemailer";
import { EmailOptions, EmailService } from "./emailService";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    password: string;
  },
  tls: {
    rejectUnauthorized: boolean;
  },
}

export class NodemailerEmailService implements EmailService {
  private smtpConfig: SmtpConfig;

  private transporter: nodemailer.Transporter;

  private from: string;

  constructor({
    smtpConfig,
    from,
  }: {
    smtpConfig: SmtpConfig;
    from: string;
  }) {
    this.smtpConfig = smtpConfig;
    this.from = from;

    this.transporter = nodemailer.createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      auth: {
        user: this.smtpConfig.auth.user,
        pass: this.smtpConfig.auth.password,
      },
      tls: {
        rejectUnauthorized: this.smtpConfig.tls.rejectUnauthorized,
      },
    });
  }

  public async sendEmail({
    to,
    subject,
    text,
    html,
  }: EmailOptions) {
    try {
      const mailOptions = {
        to,
        from: this.from,
        subject,
        text,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.info(`Email sent to ${to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }
}
