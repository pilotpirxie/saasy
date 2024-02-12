import * as handlebars from "handlebars";
import * as fs from "fs";
import path from "path";
import { EmailTemplates } from "./emailTemplates";

export class EmailTemplatesService implements EmailTemplates {
  private readonly companyName: string;

  constructor({
    companyName,
  }: {
    companyName: string;
  }) {
    this.companyName = companyName;
  }

  getVerifyEmailTemplate(options: {
    username: string;
    code: string;
  }): string {
    const invoiceTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/verifyEmail.hbs"),
      "utf8",
    );
    return handlebars.compile(invoiceTemplate)({
      companyName: this.companyName,
      ...options,
    });
  }

  getPasswordResetTemplate(options: {
    username: string;
    code: string;
  }): string {
    const invoiceTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/passwordReset.hbs"),
      "utf8",
    );
    return handlebars.compile(invoiceTemplate)({
      companyName: this.companyName,
      ...options,
    });
  }

  getInvoiceEmailTemplate(options: {
    username: string;
    invoiceId: string;
    invoiceUrl: string;
    description: string;
  }): string {
    const invoiceTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/invoice.hbs"),
      "utf8",
    );
    return handlebars.compile(invoiceTemplate)(options);
  }

  getInvitationEmailTemplate(options: {
    teamName: string;
  }): string {
    const invitationTemplate = fs.readFileSync(
      path.join(__dirname, "../templates/invitation.hbs"),
      "utf8",
    );
    return handlebars.compile(invitationTemplate)({
      companyName: this.companyName,
      ...options,
    });
  }
}
