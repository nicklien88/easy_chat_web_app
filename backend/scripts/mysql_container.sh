#!/bin/bash
# import .env variables
set -a
source .env
set +a
# 啟動 MySQL 容器
echo "DB_PASSWORD=$DB_PASSWORD"
docker rm -f easy_chat_mysql 2>/dev/null
docker run --name easy_chat_mysql \
-e MYSQL_HOST=$DB_HOST \
-e MYSQL_ROOT_PASSWORD=$DB_PASSWORD \
-e MYSQL_DATABASE=$DB_NAME \
-p $DB_PORT:3306 \
-d mysql:8.0