#!/bin/sh
# works with ubuntu:latest on 29-11-201
apt update -y && apt upgrade -y
apt-get install wget -y
apt-get install gcc -y
# wget https://www.sqlite.org/2021/sqlite-autoconf-3370000.tar.gz
tar -xvf sqlite-autoconf-3370000.tar.gz
cd sqlite-autoconf-3370000
gcc shell.c sqlite3.c -DSQLITE_ENABLE_RTREE -lpthread -ldl -lm -o sqlite3
mv sqlite3 ../sqlite3
cd ..
rm -r sqlite-autoconf-3370000
