# Kit de diagnostic : outils et méthodes du bloc 3 (CQPM 0251)

Questionnaire d'auto-évaluation accessible par **QR code**, réponses centralisées dans un **Google Sheet**, et **cartographie** des connaissances (maîtrisées, à consolider, non maîtrisées) pour adapter la formation.

```
Stagiaire ── scanne le QR code ──► index.html (GitHub Pages)
                                        │  envoi des réponses
                                        ▼
                              Google Apps Script ──► Google Sheet « Réponses »
                                        ▲
Animateur ── formateur.html ────────────┘  lecture (protégée par une clé)
```

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | Questionnaire des stagiaires (prénom + 42 outils, 4 niveaux) |
| `formateur.html` | Espace animateur : cartographie, matrice, vue par stagiaire, QR code |
| `config.js` | **Seul fichier à modifier** : adresse du script, session, seuils |
| `outils.js` | Les 42 outils (identiques à la matrice Excel) et leurs définitions |
| `apps-script/Code.gs` | Script à coller dans Google Sheets |
| `assets/` | Feuille de style, bibliothèque QR code, scripts des deux pages |

## Mise en place (environ 15 minutes)

### 1. Créer le Google Sheet
1. Créez un nouveau Google Sheet, par exemple « Diagnostic bloc 3 ».
2. Ouvrez **Extensions > Apps Script**.

### 2. Coller le script
1. Supprimez le contenu de l'éditeur, puis collez le contenu de `apps-script/Code.gs`.
2. **Changez la clé** à la ligne `const CLE_FORMATEUR = 'CHANGEZ-MOI';` : c'est le mot de passe de l'espace animateur.
3. Choisissez la fonction `initialiser` dans la barre du haut, cliquez sur **Exécuter** et acceptez les autorisations (Google signale une application non vérifiée : « Paramètres avancés > Accéder à… » ; le script est le vôtre).

### 3. Déployer le script
1. **Déployer > Nouveau déploiement**, type **Application Web**.
2. *Exécuter en tant que* : **Moi**. *Qui a accès* : **Tout le monde**.
3. Cliquez sur **Déployer** et copiez l'**URL de l'application Web** (elle se termine par `/exec`).

> Après toute modification du script, faites **Déployer > Gérer les déploiements > Modifier > Nouvelle version**, sinon l'ancienne version reste active.

### 4. Renseigner l'adresse dans le kit
Ouvrez `config.js` et remplacez `COLLER_ICI_L_URL_DU_SCRIPT_GOOGLE` par l'URL copiée à l'étape 3.

### 5. Publier sur GitHub Pages
1. Créez un dépôt GitHub (public) et déposez **tous les fichiers et dossiers** du kit à la racine.
2. **Settings > Pages** : *Source* = « Deploy from a branch », branche `main`, dossier `/ (root)`.
3. Au bout d'une minute, le site est en ligne : `https://VOTRE-COMPTE.github.io/NOM-DU-DEPOT/`.

### 6. Générer le QR code
1. Ouvrez `https://VOTRE-COMPTE.github.io/NOM-DU-DEPOT/formateur.html`.
2. Saisissez la clé animateur, puis l'onglet **QR code** : le lien du questionnaire est déjà calculé.
3. Boutons disponibles : **projeter en plein écran** (pour la salle), **télécharger en PNG** (pour une diapositive), **copier le lien**.
4. Pour séparer plusieurs groupes, renseignez le champ **Session** : le libellé est enregistré dans le Sheet.

### 7. Tester avant la formation
Répondez vous-même au questionnaire depuis votre téléphone, puis vérifiez que la ligne apparaît dans l'onglet « Réponses » du Google Sheet et dans la cartographie. Supprimez ensuite la ligne de test dans le Sheet.

## Le jour de la formation
1. Projetez le QR code (bouton « Projeter en plein écran »).
2. Les stagiaires répondent (5 à 8 minutes). Sur la page animateur, cochez **Actualiser toutes les 30 s** pour voir les réponses arriver.
3. Commentez la cartographie avec le groupe.

## Lire la cartographie

**Niveau individuel** (échelle de la matrice Excel) : 0 jamais vu · 1 de nom · 2 déjà utilisé · 3 maîtrisé.

**Lecture du groupe, par outil**, d'après la moyenne (seuils modifiables dans `config.js`) :

| Catégorie | Règle par défaut |
|---|---|
| Non maîtrisé | moyenne inférieure à 1,5 |
| À consolider | moyenne de 1,5 à moins de 2,5 |
| Maîtrisé | moyenne de 2,5 ou plus |

Les pastilles **Socle** et **Niveaux hétérogènes** (écart d'au moins 2 niveaux entre stagiaires) aident à repérer où constituer des binômes : celui qui maîtrise peut aider celui qui découvre.

Onglets : **Cartographie** (synthèse, priorités, trois colonnes, vue par étape), **Matrice détaillée** (carte de chaleur stagiaires × outils), **Par stagiaire** (profil et socle à travailler), **QR code**. Le bouton **Exporter (CSV)** produit un fichier lisible dans Excel, et **Imprimer / PDF** garde une trace de la séance.

## Bon à savoir
- **Un stagiaire peut renvoyer ses réponses** : chaque envoi crée une ligne dans le Sheet, et la cartographie ne retient que le dernier envoi par prénom (accents et majuscules ignorés). Deux stagiaires de même prénom dans une même session seraient fusionnés : ajoutez une initiale (« Marie L. »).
- **Modifier la liste des outils** : éditez `outils.js` (nom, définition, catégorie Socle ou Approfondissement). Le Google Sheet ajoute lui-même les nouvelles colonnes.
- **Confidentialité** : seul le prénom est collecté, sans compte ni cookie. L'adresse du questionnaire est publique : toute personne qui la connaît peut envoyer une réponse. La lecture des résultats, elle, exige la clé animateur. Ne diffusez pas cette clé, et ne la mettez jamais dans `config.js`.
- **Mode test** : tant que `config.js` ne contient pas l'URL du script, le questionnaire s'affiche avec un bandeau « Mode test » et n'envoie rien. L'espace animateur propose un **exemple avec données fictives** pour découvrir le rendu.

## En cas de problème
| Symptôme | Piste |
|---|---|
| « Accès refusé ou script injoignable » | Vérifier l'URL (fin en `/exec`), le déploiement « Tout le monde » et la clé |
| Les réponses n'arrivent pas dans le Sheet | Redéployer une **nouvelle version** du script après toute modification |
| Page blanche sur GitHub Pages | Attendre 1 à 2 minutes ; vérifier que `index.html` est à la racine du dépôt |
| Le QR code pointe vers une mauvaise adresse | Corriger le champ « Adresse du questionnaire » dans l'onglet QR code |
