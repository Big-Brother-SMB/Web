# ⚙️ Guide d'Exploitation (Ops)

Ce document détaille la gestion du serveur en production (Node.js + Apache2).

## 📈 Monitoring avec PM2
Pour surveiller l'état du site sur le serveur :
- **Vue d'ensemble** : `pm2 monit`
- **Logs en direct** : `pm2 logs`
- **Erreurs spécifiques** : `pm2 logs --err`

## 🔄 Maintenance Serveur
- **Relancer l'app sans coupure** : `pm2 reload all`
- **Vérifier Apache2** : `sudo systemctl status apache2`
- **Logs Apache** (si le site est inaccessible) : `sudo tail -f /var/log/apache2/error.log`

## 📡 Accès direct
Pour une intervention sans déploiement :
`ssh root@[IP_SERVEUR]`
: Demander l'IP et le PASSWORD à un ancien dev