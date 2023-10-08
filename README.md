# saasy

API starter for SaaS applications with Node, Typescript and Express. Starter provides out of the box authentication, teams management and billing.

Every user can create a team and invite other users to join the team. Each team has a role assigned to each user.
Teams can be used to group users and manage projects. Subscriptions are assigned to teams. One-time payments are assigned to users.

Features:
* login, register, forgot password, reset password
* social login with Google, GitHub
* authentication with JWT
* SMTP email service
* teams management with roles
* invitations to teams
* project management
* email notifications with SMTP
* built-in billing
* generic subscription and one-time payments with Paddle

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
```

### License
MIT