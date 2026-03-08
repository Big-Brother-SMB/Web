# INSTALLATION

1. Demander l'accès au github à un ancien dev
2. Installer **Visual Studio Code** ou **WebStorm**, **Nodejs** et **git scm** avec les liens suivants:

    - [Git](https://git-scm.com/downloads)

    - [Nodejs](https://nodejs.org/en/download/package-manager/current)

    - [VisualCodeStudio](https://code.visualstudio.com)

    - [WebStorm](https://www.jetbrains.com/webstorm/download)

3. Initier le **Repository**
    - Créer un Dossier **SMB** sur votre ordinateur
    - Ouvrir le dossier dans un terminal
    - Éxecute : ```git clone https://github.com/Big-Brother-SMB/Web.git```
    - Dans ton IDE ouvre ton projet **Web** créé par le ```git clone```
    - Importe le **code.json** disponible sur le drive développeur

4. ouvrir un terminal et exécuter la commande suivante en remplaçant par vos informations Github
   ```console
   git config --global user.name "VotreNomGithub"
   git config --global user.email "VotreMail"
   ssh-keygen -t rsa -b 4096 -C "VotreMail"
   ```

5. Rentrer le mot de passe de votre choix ainsi que le chemin de votre fichier SMB suivie de **/Key**
: Si vous recevez un message d'erreur concernant l'autorisation d'exécuter des scripts dans le PowerShell exécuter la commande suivante :
: `Set-ExecutionPolicy Bypass`
: et sélectionner un niveau de restriction moins haut

6. Installation des dépendances
Ouvrez un terminal dans le dossier **Web** et exécutez la commande suivante pour installer tous les modules nécessaires :
   ```bash
   npm install
   ```
7. Pour émuler le site en local ouvré un terminal dans **/Web** et exécuté :
   `node main.js`
puis connectez-vous à http://localhost:3000 pour voir vos changements