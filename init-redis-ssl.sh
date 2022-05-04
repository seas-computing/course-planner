#!/usr/bin/env bash
set -e

CERT_DIR=/opt/bitnami/redis/certs
export REDIS_TLS_ENABLED=yes
export REDIS_TLS_PORT=6379
export REDIS_TLS_CERT_FILE=$CERT_DIR/redis.crt
export REDIS_TLS_KEY_FILE=$CERT_DIR/redis.key
export REDIS_TLS_CA_FILE=/usr/share/ca-certificates/mozilla/VeriSign_Universal_Root_Certification_Authority.crt
export REDIS_TLS_AUTH_CLIENTS=no
(
  echo "Generating ssl key and certificate"
  umask 077
  mkdir -p $CERT_DIR
  openssl req -x509\
    -newkey rsa:4096\
    -days 3650\
    -subj "/CN=redis"\
    -nodes\
    -keyout $REDIS_TLS_KEY_FILE\
    -out $REDIS_TLS_CERT_FILE
  echo "done!"
)

/opt/bitnami/scripts/redis/setup.sh
/opt/bitnami/scripts/redis/run.sh
