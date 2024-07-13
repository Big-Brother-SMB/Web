#!/bin/bash

#configurer le certbot manuelment:
#certbot -d foyerlycee.stemariebeaucamps.fr certonly --manual
#nano /var/www/html/.well-known/acme-challenge/

#configurer le certbot pour qu'il s'update automatiquement avec "renew":
#certbot -d foyerlycee.stemariebeaucamps.fr certonly --webroot
#/var/www/html/
certbot renew --webroot -w /home/site/source/sources/ 
cp /etc/letsencrypt/live/foyerlycee.stemariebeaucamps.fr/privkey.pem /etc/apache2/certs/file.key
cp /etc/letsencrypt/live/foyerlycee.stemariebeaucamps.fr/cert.pem /etc/apache2/certs/file.crt

#get date d'expiration:
openssl x509 -dates -noout < /etc/apache2/certs/file.crt#!/bin/bash

#configurer le certbot manuelment:
#certbot -d foyerlycee.stemariebeaucamps.fr certonly --manual
#nano /var/www/html/.well-known/acme-challenge/

#configurer le certbot pour qu'il s'update automatiquement avec "renew":
#certbot -d foyerlycee.stemariebeaucamps.fr certonly --webroot
#/var/www/html/
certbot renew --webroot -w /home/site/source/sources/ 
cp /etc/letsencrypt/live/foyerlycee.stemariebeaucamps.fr/privkey.pem /etc/apache2/certs/file.key
cp /etc/letsencrypt/live/foyerlycee.stemariebeaucamps.fr/cert.pem /etc/apache2/certs/file.crt
systemctl restart apache2

#get date d'expiration:
openssl x509 -dates -noout < /etc/apache2/certs/file.crt

current_hour=$(date +"%H")

if [ "$current_hour" -ge 0 ] && [ "$current_hour" -lt 4 ]; then
    reboot
else
    echo "pas reboot"
fi