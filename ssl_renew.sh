#!/bin/bash

#configurer le certbot manuelment:
#certbot -d foyerlycee.stemariebeaucamps.fr certonly --manual
#nano /var/www/html/.well-known/acme-challenge/

#configurer le certbot pour qu'il s'update automatiquement avec "renew":
#certbot -d foyerlycee.stemariebeaucamps.fr certonly --webroot
#/var/www/html/
certbot renew
cp /etc/letsencrypt/live/foyerlycee.stemariebeaucamps.fr/privkey.pem /etc/apache2/certs/file.key
cp /etc/letsencrypt/live/foyerlycee.stemariebeaucamps.fr/cert.pem /etc/apache2/certs/file.crt

#get date d'expiration:
openssl x509 -dates -noout < /etc/apache2/certs/file.crt