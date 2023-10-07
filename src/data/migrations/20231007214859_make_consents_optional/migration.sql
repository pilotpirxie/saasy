-- AlterTable
ALTER TABLE "users" ALTER COLUMN "newsletter_consent_granted_at" DROP NOT NULL,
ALTER COLUMN "marketing_consent_granted_at" DROP NOT NULL;
