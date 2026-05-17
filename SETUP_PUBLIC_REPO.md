# Setup Guide: Push to Public Repository

## Step-by-Step Instructions

### 1. Create New Public Repository on GitHub

1. Go to https://github.com/new
2. **Repository name:** `cargotracker-modernized` (or your preferred name)
3. **Description:** "AI-Powered Legacy Modernisation with IBM Bob - Hackathon 2026"
4. **Visibility:** ✅ **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Add Public Repository as Remote

In your terminal, from the project root directory:

```bash
# Add the new public repo as a remote named "public"
git remote add public https://github.com/YOUR_USERNAME/cargotracker-modernized.git

# Verify remotes
git remote -v
# Should show:
# origin    https://github.com/YOUR_USERNAME/cargotracker-IBM-BOB.git (fetch)
# origin    https://github.com/YOUR_USERNAME/cargotracker-IBM-BOB.git (push)
# public    https://github.com/YOUR_USERNAME/cargotracker-modernized.git (fetch)
# public    https://github.com/YOUR_USERNAME/cargotracker-modernized.git (push)
```

### 3. Update README with Your URLs

Before pushing, update these placeholders in README.md and HACKATHON.md:

**Replace:**
- `YOUR_VERCEL_URL_HERE` → Your actual Vercel URL
- `YOUR_RENDER_URL_HERE` → Your actual Render URL
- `YOUR_USERNAME` → Your GitHub username

**Example:**
```markdown
# Before
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](YOUR_VERCEL_URL_HERE)

# After
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://legacylift.vercel.app)
```

### 4. Commit Documentation Changes

```bash
# Stage the new documentation files
git add README.md HACKATHON.md SETUP_PUBLIC_REPO.md

# Commit
git commit -m "docs: Add comprehensive hackathon documentation with live demo URLs"
```

### 5. Push to Public Repository

```bash
# Push main branch to public remote
git push public main

# If you have other branches you want to share:
# git push public <branch-name>
```

### 6. Verify Public Repository

1. Go to https://github.com/YOUR_USERNAME/cargotracker-modernized
2. Verify all files are present
3. Check that README.md displays correctly
4. Confirm repository is public (should see "Public" badge)

### 7. Update Vercel/Render (Optional)

**Your current deployments will continue working!** They're still connected to your private fork.

If you want to update them to use the public repo:

**Vercel:**
1. Dashboard → Project → Settings → Git
2. Disconnect current repository
3. Connect to new public repository
4. Redeploy

**Render:**
1. Dashboard → Service → Settings
2. Update repository URL
3. Trigger manual deploy

**Recommendation:** Keep them connected to private fork for now. Public repo is just for code review.

## What Gets Pushed

When you run `git push public main`, everything in your current repository will be copied:

✅ All source code (`src/`)  
✅ Dashboard (`dashboard/`)  
✅ Risk engine (`risk-engine/`)  
✅ Bob outputs (`bob-outputs/`)  
✅ Documentation (README.md, HACKATHON.md)  
✅ Configuration files (pom.xml, package.json, etc.)  
✅ Git history (all commits)  

❌ NOT pushed: `.git/` folder itself (stays local)  
❌ NOT pushed: Files in `.gitignore` (node_modules, etc.)

## Troubleshooting

### Error: "remote public already exists"
```bash
# Remove and re-add
git remote remove public
git remote add public https://github.com/YOUR_USERNAME/cargotracker-modernized.git
```

### Error: "failed to push some refs"
```bash
# Force push (safe for new empty repo)
git push public main --force
```

### Error: "Authentication failed"
```bash
# Use GitHub CLI or personal access token
gh auth login
# OR
git push https://YOUR_TOKEN@github.com/YOUR_USERNAME/cargotracker-modernized.git main
```

## Final Checklist

Before submitting to hackathon:

- [ ] Created public repository on GitHub
- [ ] Added public remote: `git remote add public ...`
- [ ] Updated README.md with live demo URLs
- [ ] Updated HACKATHON.md with live demo URLs
- [ ] Committed documentation changes
- [ ] Pushed to public repo: `git push public main`
- [ ] Verified public repo is accessible
- [ ] Tested live demo URLs work
- [ ] Confirmed Vercel/Render deployments still work
- [ ] Reviewed README.md on GitHub (renders correctly)
- [ ] Reviewed HACKATHON.md on GitHub (renders correctly)

## Submission Links

When submitting to hackathon, provide:

1. **Public Repository:** https://github.com/YOUR_USERNAME/cargotracker-modernized
2. **Live Dashboard:** https://YOUR_VERCEL_URL
3. **Live API:** https://YOUR_RENDER_URL
4. **Documentation:** Point judges to HACKATHON.md in repo

## Important Notes

### Your Private Fork
- Stays private
- Vercel/Render stay connected to it
- Live demos continue working
- No changes needed

### Your Public Repo
- For code review only
- Judges can see your work
- Shows all commits and history
- Demonstrates transparency

### Dual-Remote Strategy Benefits
✅ Live demos stay online (critical!)  
✅ Code is publicly accessible (required)  
✅ No service interruption  
✅ No reconfiguration needed  
✅ Best of both worlds  

---

**Ready to push?** Run these commands:

```bash
# 1. Create public repo on GitHub (manual step)
# 2. Add remote
git remote add public https://github.com/YOUR_USERNAME/cargotracker-modernized.git

# 3. Update URLs in README.md and HACKATHON.md (manual step)

# 4. Commit changes
git add README.md HACKATHON.md SETUP_PUBLIC_REPO.md
git commit -m "docs: Add comprehensive hackathon documentation"

# 5. Push to public
git push public main

# 6. Verify on GitHub
# Visit: https://github.com/YOUR_USERNAME/cargotracker-modernized
```

**Good luck with your hackathon submission! 🚀**