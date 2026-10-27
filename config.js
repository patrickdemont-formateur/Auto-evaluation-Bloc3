/* ==========================================================
   CONFIGURATION DU KIT : seul fichier à modifier
   ========================================================== */
window.CONFIG = {

  // 1) URL de déploiement du script Google (se termine par /exec).
  //    À coller ici une fois le script déployé (voir README.md, étape 3).
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxY9GpiAkcTDX_rbCeh_laxoUEZaSfx7LCKi9eRn__Uf67bBI6YqzmDxExHe2qJutYViA/exec",

  // 2) Libellé de la session (facultatif). Il est enregistré dans le Google Sheet
  //    et permet de séparer plusieurs groupes. On peut aussi le passer dans l'adresse
  //    du questionnaire : index.html?session=Bloc3-Octobre
  SESSION: "",

  // 3) Bandeau d'en-tête du questionnaire
  TITRE: "CQPM 0251 · Bloc 3",

  // 4) Seuils de lecture de la cartographie (moyenne du groupe, échelle de 0 à 3)
  //    moyenne < consolider           → non maîtrisé
  //    consolider ≤ moyenne < maitrise → à consolider
  //    moyenne ≥ maitrise              → maîtrisé
  SEUILS: { consolider: 1.5, maitrise: 2.5 },

  // 5) Actualisation automatique de la cartographie (en secondes)
  AUTO_REFRESH_SECONDES: 30
};
