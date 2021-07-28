# yet-another-project-starter

This boilerplate consists of a few features out-of-the-box, such as connection to the database, sequelize setup, middlewares and routes for flexible work, login & register of users and session handling. It's made for hackathons and side projects where you would have to set up these features anyway. 

### Installation
1. Import SQL
```shell script
util/db.sql
```

2. Setup FTP

It's required for avatar upload, you can simply turn it off and remove if not necessary.

```
config/config.js
```

3. Install dependencies
```shell script
# if you don't have yarn, install it first
# npm install yarn -g

# install nodemon for dev server
# yarn global add nodemon

# install dependencies
yarn

# check dependencies for vulnerabilities before running
yarn audit

# run dev server
yarn start
```
