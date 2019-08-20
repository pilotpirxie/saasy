#!/usr/bin/env bash
sudo sequelize-auto -o "./models/" -d <db_name> -u <db_user> -p 3306 -x <db_pass> -e mysql -h 'localhost'

