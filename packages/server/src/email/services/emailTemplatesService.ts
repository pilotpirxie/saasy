import * as handlebars from "handlebars";
import * as fs from "fs";
import path from "path";
import { EmailTemplates } from "./emailTemplates";

export class EmailTemplatesService implements EmailTemplates {
  private readonly companyName: string;

  private readonly baseUrl: string;

  constructor({
    companyName,
    baseUrl,
  }: {
    companyName: string;
    baseUrl: string;
  }) {
    this.companyName = companyName;
    this.baseUrl = baseUrl;
  }

  getInvoiceEmailTemplate(options: {
    username: string;
    invoiceId: string;
    invoiceUrl: string;
    description: string
  }): string {
    const invoiceTemplate = fs.readFileSync(path.join(__dirname, "../templates/invoice.hbs"), "utf8");
    return handlebars.compile(invoiceTemplate)(options);
  }

  getVerifyEmailTemplate(options: { username: string; userId: string, code: string }): string {
    const invoiceTemplate = fs.readFileSync(path.join(__dirname, "../templates/verify.hbs"), "utf8");
    return handlebars.compile(invoiceTemplate)({
      baseUrl: this.baseUrl,
      companyName: this.companyName,
      ...options,
    });
  }

  getPasswordResetTemplate(options: { username: string; userId: string; code: string }): string {
    const invoiceTemplate = fs.readFileSync(path.join(__dirname, "../emailTemplates/passwordReset.hbs"), "utf8");
    return handlebars.compile(invoiceTemplate)({
      baseUrl: this.baseUrl,
      companyName: this.companyName,
      ...options,
    });
  }
}
