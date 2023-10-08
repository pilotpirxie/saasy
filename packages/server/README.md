# @saasy/server

Minimal api server using Typescript, Express and Node.

### Environment variables
```shell
NODE_ENV="development"

DATABASE_URL="postgresql://mysecretuser:mysecretpassword@localhost:5432/mydb"
MAX_BODY_SIZE="128KB"

JWT_SECRET="723d6681-9236-469a-a593-e532bec937e6"
JWT_TIMEOUT="1h"
JWT_REFRESH_TIMEOUT="30 days"

SMTP_HOST="smtp.ethereal.email"
SMTP_PORT="587"
SMTP_USER="your.user@smtp"
SMTP_PASSWORD="password"
SMTP_REJECT_UNAUTHORIZED="false"
SMTP_SECURE="false"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### License
MIT