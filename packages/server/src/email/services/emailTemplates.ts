export type EmailTemplates = {
  getRegisterVerifyTemplate(options: {
    username: string,
    userId: string,
    code: string
  }): string;

  getInvitationEmail(): string;

  getVerifyEmailTemplate(options: {
    username: string,
    userId: string,
    code: string
  }): string;

  getPasswordResetTemplate(options: {
    username: string,
    userId: string,
    code: string
  }): string;

  getInvoiceEmailTemplate(options: {
    username: string,
    invoiceId: string,
    invoiceUrl: string,
    description: string
  }): string;
}
