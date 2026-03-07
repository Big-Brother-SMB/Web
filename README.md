# 🌐 Web - Foyer du Lycée Sainte-Marie

Bienvenue sur le dépôt officiel du site web du Foyer du Lycée Sainte-Marie à Beaucamps-Ligny. Ce projet, en production depuis le 28 décembre 2021, assure la gestion et l'interface numérique des activités du Foyer.

## ⚖️ Propriété Intellectuelle

Les droits d'auteur de ce code source sont protégés par l’article **L. 111-1 du code de la propriété intellectuelle (CPI)**.

> [IMPORTANT]
> Toute copie, reproduction ou utilisation autre que celle prévue dans le cadre du Lycée Sainte-Marie à Beaucamps-Ligny est strictement prohibée.

---

## 📚 Documentation du Projet

Pour garantir la maintenance à long terme de l'infrastructure, la documentation est sectorisée par usage :

| Guide | Description | Public visé |
| :--- | :--- | :--- |
| [🚀 **Installation**](./docs/INSTALL.md) | Pré-requis (Node/PM2), setup initial et démarrage. | Nouveaux Devs / Ops |
| [🛠️ **Développement**](./docs/DEVELOPMENT.md) | Standards de code, tests et workflow Git. | Développeurs |
| [⚙️ **Exploitation (PM2)**](./docs/OPERATIONS.md) | Commandes de production, logs et relances. | Administrateurs / DevOps |
| [🏗️ **Architecture**](./docs/ARCHITECTURE.md) | Schéma des flux (Apache, PM2, DB) et choix techniques. | Tous |
| [🚑 **Dépannage**](./docs/TROUBLESHOOTING.md) | Résolution des erreurs communes et procédures d'urgence. | Support / Ops |

---

## 🛠️ Stack Technique & Infrastructure

L'application repose sur un écosystème robuste pour assurer une haute disponibilité :

*   **Runtime :** Node.js
*   **Gestionnaire de processus :** PM2 (Persistence et monitoring)
*   **Serveur Web / Reverse Proxy :** Apache2
*   **Environnement :** Debian / Linux

---

## 🔑 Gestion des Secrets

Pour des raisons de sécurité (dépôt public), les variables d'environnement ne sont pas versionnées.

Pour toute demande liée aux variables d'environnements, veuillez vous référer à un dev.

