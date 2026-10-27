/* ==========================================================
   LISTE DES OUTILS ÉVALUÉS (identique à la matrice Excel)
   Pour ajouter / retirer un outil : modifier ce fichier uniquement.
   Le Google Sheet crée automatiquement les colonnes nécessaires.
   ========================================================== */
window.NIVEAUX = [
  { n: 0, court: "Jamais vu",    long: "Je ne connais pas cet outil." },
  { n: 1, court: "De nom",       long: "J'en ai entendu parler ou je l'ai vu en théorie, sans l'avoir pratiqué." },
  { n: 2, court: "Déjà utilisé", long: "Je l'ai utilisé en exercice ou au travail, avec un appui." },
  { n: 3, court: "Maîtrisé",     long: "Je l'ai appliqué seul(e) et je saurais l'expliquer à un collègue." }
];

window.ETAPES = [
  { titre: "Détecter et faire remonter",       sous: "Repérer un dysfonctionnement et le signaler" },
  { titre: "Décrire, qualifier et analyser",   sous: "Comprendre le problème et chercher ses causes" },
  { titre: "Structurer la démarche",           sous: "Choisir une méthode de résolution de problème" },
  { titre: "Choisir et argumenter la solution",sous: "Décider, justifier et présenter sa proposition" },
  { titre: "Conduire et suivre les actions",   sous: "Piloter le plan d'actions et mesurer les effets" },
  { titre: "Communiquer et animer",            sous: "Mobiliser l'équipe autour du projet" },
  { titre: "Préparer l'évaluation",            sous: "Rendre compte de son projet devant la commission" }
];

/* etape = index dans ETAPES · categorie = Socle | Approfondissement · comp = compétence visée */
window.OUTILS = [
  { id:"01", etape:0, categorie:"Socle",             comp:"6",     nom:"Observation terrain (Gemba)",
    def:"Aller voir sur le terrain, au poste, ce qui se passe réellement avant de décider quoi que ce soit." },
  { id:"02", etape:0, categorie:"Socle",             comp:"6",     nom:"Fiche de remontée d'anomalie / de proposition d'amélioration",
    def:"Document prévu dans l'entreprise pour signaler un problème ou une idée, et en garder la trace." },
  { id:"03", etape:0, categorie:"Socle",             comp:"6",     nom:"Management visuel, tableau SQCDP / tableau de bord d'équipe",
    def:"Tableau affiché à l'atelier qui suit chaque jour la Sécurité, la Qualité, les Coûts, les Délais et les Personnes." },
  { id:"04", etape:0, categorie:"Approfondissement", comp:"6",     nom:"Audits de proximité 5S / sécurité",
    def:"Contrôle régulier, sur une grille, de l'ordre, de la propreté et de la sécurité d'un poste ou d'une zone." },
  { id:"05", etape:0, categorie:"Socle",             comp:"6",     nom:"Brainstorming / recueil des avis de l'équipe",
    def:"Faire s'exprimer l'équipe pour collecter des idées ou des points de vue, sans les juger tout de suite." },
  { id:"06", etape:0, categorie:"Approfondissement", comp:"6",     nom:"Chasse aux 7 gaspillages (Muda), diagramme spaghetti",
    def:"Repérer les attentes, déplacements, stocks et défauts inutiles. Le diagramme spaghetti trace les déplacements sur un plan." },

  { id:"07", etape:1, categorie:"Socle",             comp:"6",     nom:"QQOQCCP (ou 5W2H)",
    def:"Décrire un problème avec les questions Quoi, Qui, Où, Quand, Comment, Combien, Pourquoi." },
  { id:"08", etape:1, categorie:"Approfondissement", comp:"6",     nom:"Is / Is not",
    def:"Délimiter un problème en comparant où et quand il apparaît avec où et quand il n'apparaît pas." },
  { id:"09", etape:1, categorie:"Socle",             comp:"6",     nom:"Check-sheet (feuille de relevés)",
    def:"Feuille de relevés simple pour compter sur le terrain les défauts ou les événements, au fil de l'eau." },
  { id:"10", etape:1, categorie:"Socle",             comp:"6",     nom:"Diagramme de Pareto (80/20)",
    def:"Classer les causes ou les défauts par importance pour traiter en priorité les quelques-uns qui pèsent le plus." },
  { id:"11", etape:1, categorie:"Socle",             comp:"6",     nom:"Diagramme d'Ishikawa (5M / 6M)",
    def:"Schéma en arêtes de poisson qui classe les causes possibles par famille : main-d'œuvre, matière, machine, méthode, milieu." },
  { id:"12", etape:1, categorie:"Socle",             comp:"6",     nom:"5 Pourquoi",
    def:"Se demander « pourquoi ? » plusieurs fois de suite pour remonter à la cause racine." },
  { id:"13", etape:1, categorie:"Approfondissement", comp:"6",     nom:"Arbre des causes",
    def:"Représenter l'enchaînement des faits qui ont conduit à un incident, pour comprendre ce qui s'est réellement passé." },
  { id:"14", etape:1, categorie:"Approfondissement", comp:"6",     nom:"Histogramme, courbes de tendance, cartes de contrôle (MSP)",
    def:"Représenter des mesures pour voir leur répartition, leur évolution ou leur dérive dans le temps." },
  { id:"15", etape:1, categorie:"Approfondissement", comp:"6",     nom:"AMDEC simplifiée",
    def:"Lister ce qui peut mal tourner, noter gravité, fréquence et détection, pour traiter les risques les plus importants." },

  { id:"16", etape:2, categorie:"Socle",             comp:"6 et 7",nom:"PDCA",
    def:"Cycle en 4 temps (Planifier, Réaliser, Vérifier, Ajuster) pour améliorer pas à pas." },
  { id:"17", etape:2, categorie:"Socle",             comp:"6 et 7",nom:"8D",
    def:"Méthode en 8 étapes pour traiter un problème qualité, du confinement à la prévention de la récidive." },
  { id:"18", etape:2, categorie:"Socle",             comp:"6 et 7",nom:"QRQC",
    def:"Réaction rapide au poste : on constate, on analyse sur place, on traite et on suit sans attendre." },
  { id:"19", etape:2, categorie:"Approfondissement", comp:"6 et 7",nom:"DMAIC",
    def:"Démarche Lean Six Sigma en 5 étapes : Définir, Mesurer, Analyser, Améliorer, Contrôler." },
  { id:"20", etape:2, categorie:"Approfondissement", comp:"6",     nom:"A3 / rapport A3",
    def:"Synthèse d'un projet sur une seule feuille : problème, analyse, actions, résultats attendus." },
  { id:"21", etape:2, categorie:"Approfondissement", comp:"7",     nom:"Kaizen / chantier flash",
    def:"Amélioration rapide, menée avec l'équipe sur quelques jours, sur un problème précis et local." },

  { id:"22", etape:3, categorie:"Socle",             comp:"6",     nom:"Matrice effort / impact",
    def:"Placer les idées sur un graphique selon l'effort demandé et le gain apporté, pour choisir lesquelles lancer." },
  { id:"23", etape:3, categorie:"Socle",             comp:"6 et 7",nom:"Grille coût – délai – sécurité – environnement",
    def:"Vérifier, pour chaque solution, ce qu'elle coûte, le temps qu'elle demande et ses effets sur la sécurité et l'environnement." },
  { id:"24", etape:3, categorie:"Approfondissement", comp:"6",     nom:"Matrice de décision pondérée",
    def:"Comparer plusieurs solutions avec des critères notés et pondérés, pour justifier le choix." },
  { id:"25", etape:3, categorie:"Socle",             comp:"6 et 7",nom:"Objectif SMART",
    def:"Fixer un objectif Spécifique, Mesurable, Atteignable, Réaliste et Temporel." },
  { id:"26", etape:3, categorie:"Approfondissement", comp:"6",     nom:"Solutions types : poka-yoke, standardisation, SMED",
    def:"Leviers techniques classiques : empêcher l'erreur par conception, écrire un standard, réduire les temps de changement de série." },
  { id:"27", etape:3, categorie:"Socle",             comp:"6",     nom:"Trame d'argumentaire écrit + pitch oral",
    def:"Présenter une proposition de façon claire et convaincante : description, moyens, objectifs, délais, implication de chacun." },

  { id:"28", etape:4, categorie:"Socle",             comp:"7",     nom:"Plan d'actions (quoi, qui, quand, comment, indicateur, statut)",
    def:"Tableau qui précise, pour chaque action, qui fait quoi, pour quand, avec quel indicateur et où l'on en est." },
  { id:"29", etape:4, categorie:"Socle",             comp:"7",     nom:"Rôles dans un projet : sponsor, pilote, contributeurs (RACI simplifiée)",
    def:"Clarifier qui décide, qui pilote, qui contribue et qui doit être informé." },
  { id:"30", etape:4, categorie:"Socle",             comp:"7",     nom:"Planning à jalons / Gantt simplifié",
    def:"Visualiser sur une frise les étapes clés d'un projet et leurs échéances." },
  { id:"31", etape:4, categorie:"Approfondissement", comp:"7",     nom:"Cartographie des parties prenantes",
    def:"Identifier les personnes ou services concernés par le projet, et ce que l'on attend d'eux." },
  { id:"32", etape:4, categorie:"Socle",             comp:"7",     nom:"Indicateurs avant / après et courbe de suivi",
    def:"Mesurer la situation avant l'action, puis après, pour prouver l'effet obtenu." },
  { id:"33", etape:4, categorie:"Socle",             comp:"7",     nom:"Point d'avancement flash / revue d'actions",
    def:"Réunion courte et régulière pour faire le point sur chaque action et débloquer ce qui coince." },
  { id:"34", etape:4, categorie:"Socle",             comp:"7",     nom:"Format d'alerte argumentée (type SBAR)",
    def:"Alerter sa hiérarchie en quatre temps : Situation, Contexte, Évaluation, Recommandation." },
  { id:"35", etape:4, categorie:"Approfondissement", comp:"7",     nom:"Standardisation (SDCA) et retour d'expérience",
    def:"Écrire et diffuser la bonne façon de faire une fois l'amélioration validée, et partager ce qu'on en a appris." },

  { id:"36", etape:5, categorie:"Approfondissement", comp:"6 et 7",nom:"Animation de réunion (type AIC)",
    def:"Conduire un point d'équipe court et structuré (type AIC), avec indicateurs, décisions et actions." },
  { id:"37", etape:5, categorie:"Socle",             comp:"6",     nom:"Techniques de créativité et de priorisation en groupe (brainwriting, vote)",
    def:"Faire produire des idées à plusieurs (brainwriting) puis choisir ensemble (vote par gommettes)." },
  { id:"38", etape:5, categorie:"Socle",             comp:"7",     nom:"Communication d'un changement à l'équipe",
    def:"Annoncer une modification : expliquer pourquoi, ce qui change, ce que chacun doit faire et à quelle date." },
  { id:"39", etape:5, categorie:"Approfondissement", comp:"7",     nom:"Gestion des résistances au changement",
    def:"Comprendre les freins de l'équipe et y répondre pour obtenir son adhésion." },

  { id:"40", etape:6, categorie:"Socle",             comp:"6 et 7",nom:"Dossier / rapport de projet (trame calée sur les critères)",
    def:"Rédiger la trace écrite du projet, construite pour répondre aux critères d'évaluation du référentiel." },
  { id:"41", etape:6, categorie:"Socle",             comp:"6 et 7",nom:"Soutenance orale devant la commission",
    def:"Présenter son projet à l'oral et défendre ses choix de méthode face aux questions du jury." },
  { id:"42", etape:6, categorie:"Approfondissement", comp:"6 et 7",nom:"Grille d'auto-évaluation par critère du référentiel",
    def:"Vérifier, critère par critère, que l'on a les preuves de ses compétences avant l'évaluation." }
];
