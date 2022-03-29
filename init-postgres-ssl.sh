#!/usr/bin/env bash
set -e

(
  echo "Generating ssl key and certificate"
  umask 077
  openssl req -x509\
    -newkey rsa:4096\
    -days 3650\
    -subj "/CN=postres"\
    -nodes\
    -keyout /var/lib/postgresql/data/server.key\
    -out /var/lib/postgresql/data/server.crt
  echo "done!"
)
