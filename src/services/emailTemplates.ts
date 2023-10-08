export type EmailTemplates = {
  getVerifyEmailTemplate(options: {
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
