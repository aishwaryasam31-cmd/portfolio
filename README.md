# Aishwarya S: Portfolio (VS Code + Firebase)

Plain HTML, CSS and JavaScript. No Node.js or build step needed.

## 1. Firebase setup (free plan)
1. Go to https://console.firebase.google.com and create a project.
2. Build > Authentication > Get started > turn on Email/Password. Then Users > Add user (your email + a strong password).
3. Build > Firestore Database > Create database (production mode).
4. Firestore > Rules: paste the contents of firestore.rules and put YOUR email in it. Publish.
5. Project settings > Your apps > Web (</>) > register app > copy the config into firebase-config.js. Set OWNER_EMAIL to the same email as step 4.

## 2. Run in VS Code
1. Install VS Code and the "Live Server" extension.
2. Open this folder, right-click index.html > Open with Live Server.
3. Click "Admin" (bottom of the page), log in. Add / Delete buttons appear only for you.
4. First time: click "Import starter content", then "Edit profile & links" to add your photo, LinkedIn, GitHub, email and resume link.
5. Add certificates, achievements (with proof photos), projects (GitHub link optional) and internships with the + Add buttons. No code changes needed.

## 3. Publish (free link for LinkedIn)
Firebase Hosting: npm i -g firebase-tools, then firebase login, firebase init hosting (public folder = this folder, single-page app = No), then firebase deploy.
If you use another host (GitHub Pages / Netlify), add its domain in Authentication > Settings > Authorized domains.

## Notes
- Images are resized in the browser and stored inside Firestore, so you do not need Firebase Storage (which may require a paid plan).
- Visitors can only read. Only your email can write, enforced by firestore.rules.
