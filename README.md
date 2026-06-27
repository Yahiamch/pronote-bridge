# Forge · Fitness OS

A beautiful, dark fitness dashboard for **desktop and mobile** — designed to manage the muscle-building side of your life. Built to match a premium, all-black UI with real, editable data and live charts.

![Forge](public/favicon.svg)

## ✨ Fonctionnalités

- **Accueil (Workouts)** — vue d'ensemble façon bento : série en cours, poids de corps avec mini-graphe, heatmap d'activité (style points Jan/Fév/Mar), volume soulevé, hydratation, collections en dossiers et accès programme.
- **Entraînements** — démarre une séance, suis tes séries (reps × charge), coche-les en direct, chronomètre live, volume/calories en temps réel, et enregistre la séance.
- **Hydratation** — anneau de progression + remplissage liquide animé, ajouts rapides (verre / bouteille / gourde), moyenne 7 jours et graphique hebdomadaire.
- **Programmes** — programme « 28-Day Ignite » avec jours verrouillés/débloqués, calories & durée, bouton *Commencer* et progression.
- **Statistiques** — KPIs (volume, séances, calories, durée) + graphiques réels : volume hebdomadaire, poids de corps, séances par jour, calories brûlées. Plages 4 / 8 / 12 semaines.
- **Calendrier** — heatmap mensuelle des séances + détail par jour.
- **Coach** — insights automatiques calculés depuis tes données (tendance volume, hydratation, série, poids, récupération) + mini-chat de conseils.
- **Réglages** — profil, unités kg/lbs, objectif d'eau, réinitialisation.

## 🎨 Design

- Noir pur, cartes en dégradé, formes « dossier » avec onglet, effet grain subtil.
- Animations fluides (Framer Motion) : transitions de page, compteurs animés, anneaux de progression, indicateurs de navigation partagés.
- Entièrement **responsive** : barre latérale sur ordinateur, dock flottant en bas sur mobile, barre « séance en cours » persistante.

## 🛠️ Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (thème personnalisé)
- **Framer Motion** (animations)
- **Recharts** (graphiques, chargés à la demande)
- **Zustand** + persistance `localStorage` (tes données restent sur l'appareil)

## 🚀 Démarrage

```bash
npm install      # installe les dépendances
npm run dev      # serveur de développement (http://localhost:5173)
npm run build    # build de production
npm run preview  # prévisualise le build
```

## ⚡ Optimisations

- Routes **code-splittées** (chaque page = chunk séparé).
- **Recharts chargé à la demande** : la page d'accueil utilise un sparkline SVG ultra-léger maison, donc le gros chunk graphique ne se charge que sur les pages d'analyse.
- Compteurs et graphes animés via `requestAnimationFrame`, sans dépendance lourde.

---

Les données sont pré-remplies (~5 mois de séances réalistes) pour que les graphiques soient vivants dès le premier lancement — tout est ensuite modifiable et persistant.
