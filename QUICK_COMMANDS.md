# Quick Commands for Hackathon Submission

## Your Repositories

**Current (Private):** https://github.com/Rubywiz/cargotracker-IBM-BOB  
**Public (Hackathon):** https://github.com/Rubywiz/Legacylift-IBM-BOB

## Option 1: Use the Script (Easiest)

```bash
# Run the automated script
./PUSH_TO_PUBLIC.sh
```

The script will:
- Add the public remote
- Check for uncommitted changes
- Push to public repository
- Verify success

## Option 2: Manual Commands

```bash
# 1. Add public remote
git remote add public https://github.com/Rubywiz/Legacylift-IBM-BOB.git

# 2. Verify remotes
git remote -v

# 3. Check status
git status

# 4. Commit any changes (if needed)
git add .
git commit -m "docs: Add hackathon documentation"

# 5. Push to public repo
git push public main
```

## Update Live Demo URLs

Before pushing, update these placeholders in README.md and HACKATHON.md:

**Find and replace:**
- `YOUR_VERCEL_URL_HERE` → Your actual Vercel URL
- `YOUR_RENDER_URL_HERE` → Your actual Render URL
- `YOUR_USERNAME` → `Rubywiz` (already correct in most places)

**Example:**
```bash
# Use your editor or sed command
sed -i '' 's/YOUR_VERCEL_URL_HERE/https:\/\/legacylift.vercel.app/g' README.md HACKATHON.md
sed -i '' 's/YOUR_RENDER_URL_HERE/https:\/\/legacylift-api.onrender.com/g' README.md HACKATHON.md
```

## Verify After Push

1. Visit: https://github.com/Rubywiz/Legacylift-IBM-BOB
2. Check README.md displays correctly
3. Verify all files are present
4. Test live demo links work

## Troubleshooting

### Authentication Error
```bash
# Use GitHub CLI
gh auth login

# Or use personal access token
git push https://YOUR_TOKEN@github.com/Rubywiz/Legacylift-IBM-BOB.git main
```

### Remote Already Exists
```bash
# Remove and re-add
git remote remove public
git remote add public https://github.com/Rubywiz/Legacylift-IBM-BOB.git
```

### Force Push (if needed)
```bash
git push public main --force
```

## What Gets Pushed

✅ All source code  
✅ Dashboard and risk-engine  
✅ Bob outputs (analysis files)  
✅ Documentation (README, HACKATHON.md)  
✅ All commits and history  

❌ node_modules (in .gitignore)  
❌ .env files (in .gitignore)  
❌ Build artifacts (in .gitignore)

## Your Deployments Stay Safe

- **Vercel** stays connected to: cargotracker-IBM-BOB (private)
- **Render** stays connected to: cargotracker-IBM-BOB (private)
- **Public repo** is for: Code review only
- **Live demos** continue working without interruption

## Final Checklist

- [ ] Created public repo: https://github.com/Rubywiz/Legacylift-IBM-BOB
- [ ] Updated live demo URLs in README.md and HACKATHON.md
- [ ] Committed documentation changes
- [ ] Ran `./PUSH_TO_PUBLIC.sh` or manual commands
- [ ] Verified public repo is accessible
- [ ] Tested README.md renders correctly on GitHub
- [ ] Confirmed live demos still work
- [ ] Ready to submit to hackathon!

## Submission Links

When submitting to hackathon, provide:

1. **GitHub Repository:** https://github.com/Rubywiz/Legacylift-IBM-BOB
2. **Live Dashboard:** [Your Vercel URL]
3. **Live API:** [Your Render URL]
4. **Documentation:** Point to HACKATHON.md in the repo

---

**Ready to push? Run:** `./PUSH_TO_PUBLIC.sh`