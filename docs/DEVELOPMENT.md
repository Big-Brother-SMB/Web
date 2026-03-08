# 🛠️ Guide de Développement

## Workflow Git
Pour maintenir un code propre, merci de respecter ces étapes :
1. **Branche** : Évitez de travailler directement sur **main**, essayez de créer des branches selon les [conventions de nommages](#conventions-de-nommage).
2. **Tests** : Vérifiez toujours votre modification en local (`http://localhost:3000`) avant de push.
3. **Commit** : Utilisez des messages clairs (ex: `fix: correction bug formulaire`) voir les [conventions de nommages](#conventions-de-nommage).
4. **Versioning** : Une fois vos modifications apportées à main, allez sur votre branche main et exécutez :
   ```bash
   npm version patch # 1.1.1 --> 1.1.2
   npm version minor # 1.1.1 --> 1.2.0
   npm version major # 1.1.1 --> 2.0.0
   ```
   En fonction de votre modification. N'oubliez pas de push après 

## Structure du Code
- `main.js` : Point d'entrée principal (Serveur Express/Socket.io).
- `/sources` : Contient les assets (CSS, JS client, Images).
- `code.json` : Contient les clés d'API et configurations sensibles (Non versionné).

## Standards
- Utilisez le format **ES6** pour le JavaScript.
- Commentez vos fonctions complexes, surtout si elles touchent à la base de données SQLite.

---

<a name="conventions-de-nommage"></a>
## Conventions de nommage
### 🌿 Gestion des Branches
Pour maintenir un dépôt organisé, utilisez des slashs `/` pour catégoriser vos branches.

| Préfixe         | Description                     | Exemple                 |
|:----------------|:--------------------------------|:------------------------|
| **`feature/`**  | Nouvelle fonctionnalité         | `feature/login-page`    |
| **`bugfix/`**   | Correction d'un bug standard    | `bugfix/header-spacing` |
| **`hotfix/`**   | Correction urgente (Production) | `hotfix/security-patch` |
| **`docs/`**     | Mise à jour de la documentation | `docs/update-readme`    |
| **`refactor/`** | Amélioration du code existant   | `refactor/api-logic`    |

---

### 💬 Conventions de Commits
Nous suivons la norme **Conventional Commits**. Le format à respecter est : `type: description`.
Nous vous invitons à rajouter des [Gitmoji](https://gitmoji.dev/) en début de commit pour mettre de la couleur dans le GitHub

| Préfixe         | Description                                | Exemple                            |
|:----------------|:-------------------------------------------|:-----------------------------------|
| **`feat:`**     | Ajout d'une fonctionnalité                 | `feat: add contact form`           |
| **`fix:`**      | Correction d'un bug                        | `fix: resolve validation error`    |
| **`docs:`**     | Modification de la documentation           | `docs: add installation steps`     |
| **`style:`**    | Changement de formatage (espaces, etc.)    | `style: fix indentation`           |
| **`refactor:`** | Nettoyage de code (sans nouvelle fonction) | `refactor: simplify user function` |
| **`perf:`**     | Amélioration des performances              | `perf: lazy load images`           |
| **`build:`**    | Système de build ou dépendances            | `build: update express version`    |
| **`ci:`**       | Configuration CI/CD (GitHub Actions)       | `ci: add test workflow`            |
| **`chore:`**    | Tâches diverses (ex: .gitignore)           | `chore: update .gitignore`         |

---

## 🔗 Liaison aux Issues
Pour fermer automatiquement une issue lors de la fusion (merge) d'une branche, ajoutez ceci à la fin de votre message de commit ou de votre Pull Request :
- `Closes #123` (remplacez 123 par le numéro de l'issue).