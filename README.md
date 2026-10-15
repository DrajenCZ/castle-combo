# Hradní devatero – počítání bodů

Offline score counter for the board game Castle Combo (CZ: Hradní devatero).
Pick the 9 cards of each player by hand or recognise them from a photo; everything runs
on the phone, with no server and no AI calls. See `docs/design.md`.

## Install on Android

1. Open the GitHub Pages address of this repository in Chrome.
2. Menu ⋮ → **Install app** (or **Add to Home screen**).
3. The app opens full screen and works offline from then on.

## Develop

```
npm install
npm run dev
npm test
```

Every push to `main` runs the tests, builds the app and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`).
