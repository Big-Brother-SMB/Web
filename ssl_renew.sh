#!/bin/bash
certbot renew --webroot -w /home/site/source/sources/
cp /etc/letsencrypt/live/foyerlycee.stemariebeaucamps.fr/privkey.pem /etc/apache2/certs/file.key
cp /etc/letsencrypt/live/foyerlycee.stemariebeaucamps.fr/cert.pem /etc/apache2/certs/file.crt
systemctl restart apache2
openssl x509 -dates -noout < /etc/apache2/certs/file.crt
