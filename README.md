# React Application with Routing & GitHub Pages Deployment

**Aim**: Hosting the Website with Domain Registration Process for VS Code  
**Author / GitHub Username**: `vedantrade-bit`  
**Live URL**: `https://vedantrade-bit.github.io/my-react-app`

---

## 📌 Objectives & Outcomes
- Understand how to register a custom domain and manage DNS records.
- Build and structure a React application using `HashRouter` for SPA routing without 404s.
- Deploy the production build to **GitHub Pages** using `gh-pages`.
- Link custom domains to GitHub Pages via DNS `A` and `CNAME` records.

---

## 🚀 Step-by-Step Execution Guide

### 1. Authenticate with GitHub
In your VS Code terminal, run:
```bash
gh auth login
```
Choose:
- Host: **GitHub.com**
- Protocol: **HTTPS**
- Authenticate Git: **Yes**
- Login method: **Login with a web browser**

### 2. Create the Remote Repository on GitHub
If you haven't created the repository on GitHub yet, you can do it with one command:
```bash
gh repo create my-react-app --public --source=. --remote=origin --push
```
*Or manually create a repository named `my-react-app` at https://github.com/new and push:*
```bash
git push -u origin main
```

### 3. Deploy to GitHub Pages
To build and publish the live site to the `gh-pages` branch:
```bash
npm run deploy
```
Once it says **"Published"**, visit:
👉 **https://vedantrade-bit.github.io/my-react-app/**

---

## 🌐 Custom Domain Registration & DNS Setup (Aim & Objectives)

If linking a custom domain (e.g. `vedantrade.com`):

1. **Register the Domain**:
   - Purchase your domain from registrars like GoDaddy, Namecheap, Google Domains, or Cloudflare.

2. **Configure DNS Records** in your Domain Registrar's DNS panel:
   | Type | Host / Name | Target / Value | Purpose |
   |------|-------------|----------------|---------|
   | `A` | `@` | `185.199.108.153` | Points apex domain to GitHub Pages |
   | `A` | `@` | `185.199.109.153` | Redundant GitHub IP |
   | `A` | `@` | `185.199.110.153` | Redundant GitHub IP |
   | `A` | `@` | `185.199.111.153` | Redundant GitHub IP |
   | `CNAME` | `www` | `vedantrade-bit.github.io` | Subdomain routing |

3. **Link Domain on GitHub**:
   - Go to your repository on GitHub: `https://github.com/vedantrade-bit/my-react-app/settings/pages`
   - Under **Custom domain**, type your domain name (e.g. `www.yourdomain.com`).
   - Click **Save**.
   - Check **Enforce HTTPS** once DNS check passes.
