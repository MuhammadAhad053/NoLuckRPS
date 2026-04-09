# Game Deployment Guide

This project is ready to be deployed to **GitHub** and **Vercel**.

## 1. Export to GitHub
To push this code to GitHub:
1. Click the **Settings** (gear icon) in the top right corner of AI Studio.
2. Select **"Export to GitHub"**.
3. Follow the prompts to connect your GitHub account and create a new repository.

## 2. Deploy to Vercel
Once your code is on GitHub:
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Import the repository you just created.
4. Vercel will automatically detect **Vite** as the framework.
5. Click **"Deploy"**.

## 3. Environment Variables (Optional but Recommended)
The app currently uses `firebase-applet-config.json` for configuration. If you want to keep your keys out of the repository:
1. Add `firebase-applet-config.json` to your `.gitignore`.
2. Update `src/firebase.ts` to use `import.meta.env` variables.
3. Set the corresponding variables in the Vercel Project Settings.

## Local Development
```bash
npm install
npm run dev
```
