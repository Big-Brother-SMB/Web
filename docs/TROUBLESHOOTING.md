# 🚑 Dépannage (Troubleshooting)

### 1. Le site ne répond plus (502 Bad Gateway)
**Cause** : Le processus Node.js est arrêté ou Apache ne trouve plus le flux.
**Solution** :
- Se connecter en SSH.
- Vérifier PM2 : `pm2 status`.
- Si arrêté : `pm2 start ecosystem.config.js`.

### 2. Erreur "Database is locked"
**Cause** : SQLite subit trop d'écritures simultanées ou un processus est resté bloqué.
**Solution** : Redémarrer proprement l'instance : `pm2 reload all`.