> **Créé par Margot Tournier & Aurélien Moote - Moo - 2026. Logiciel libre (licence MIT) :**
> réutilisable à condition de conserver la mention des auteurs.

# CatDex 🐾

**Le Pokémon GO des chats.** Photographiez les chats que vous croisez dans la rue, constituez votre collection et explorez vos découvertes sur une carte.

Application web mobile-first, 100 % locale (aucune donnée envoyée sur un serveur), déployée sur GitHub Pages.

🌐 **Demo :** https://auremoo.github.io/catch-cat/

---

## Fonctionnalités

- **📸 Capture** — photo via caméra + géolocalisation automatique
- **📖 CatDex** — grille de vos chats avec compteur d'apparitions et recherche
- **🗺️ Carte** — carte interactive (Leaflet / CartoDB Dark) avec vos photos en markers
- **📊 Stats** — streak de jours 🔥, distribution des couleurs, activité sur 7 jours
- **Profil par chat** — galerie photos, mini-carte, historique des apparitions, édition du nom et de la couleur

## Stack technique

| Élément | Choix |
|---|---|
| UI | React 18 + Vite 5 |
| Style | Tailwind CSS 3 |
| Carte | Leaflet + react-leaflet |
| Stockage | IndexedDB (navigateur, sans serveur) |
| Déploiement | GitHub Pages via GitHub Actions |

## Démarrage rapide

```bash
npm install
npm run dev
```

Le build de production :

```bash
npm run build
```

## Déploiement GitHub Pages

Chaque push sur `main` déclenche le workflow `.github/workflows/deploy.yml` qui build et publie automatiquement.

Activer une seule fois : **Settings → Pages → Source → GitHub Actions**.

---

## Auteur & licence

**Auteurs / Authors : Margot Tournier - Aurélien Moote - Moo - 2026**

Copyright (c) 2026 Margot Tournier & Aurélien Moote ("Moo")

Distribué sous [licence MIT](./LICENSE) — réutilisable librement à condition de conserver la mention des auteurs.
Voir aussi : [NOTICE](./NOTICE) · [AUTHORS](./AUTHORS)
