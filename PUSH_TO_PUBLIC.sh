#!/bin/bash

# LegacyLift - Push to Public Repository Script
# This script will push your work to the public hackathon repository

echo "🚀 LegacyLift - Pushing to Public Repository"
echo "=============================================="
echo ""

# Repository URLs
CURRENT_REPO="https://github.com/Rubywiz/cargotracker-IBM-BOB"
PUBLIC_REPO="https://github.com/Rubywiz/Legacylift-IBM-BOB"

echo "Current (Private): $CURRENT_REPO"
echo "Public (Hackathon): $PUBLIC_REPO"
echo ""

# Check if public remote already exists
if git remote | grep -q "^public$"; then
    echo "⚠️  Remote 'public' already exists. Removing..."
    git remote remove public
fi

# Add public remote
echo "📡 Adding public remote..."
git remote add public $PUBLIC_REPO

# Verify remotes
echo ""
echo "✅ Remotes configured:"
git remote -v
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "⚠️  Skipping commit. Only committed changes will be pushed."
    fi
    echo ""
fi

# Push to public repository
echo "🚀 Pushing to public repository..."
echo "This will push all commits and files to: $PUBLIC_REPO"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push public main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to public repository!"
        echo ""
        echo "🎉 Your hackathon submission is now public at:"
        echo "   $PUBLIC_REPO"
        echo ""
        echo "📋 Next steps:"
        echo "   1. Visit: https://github.com/Rubywiz/Legacylift-IBM-BOB"
        echo "   2. Verify all files are present"
        echo "   3. Check README.md displays correctly"
        echo "   4. Update live demo URLs if needed"
        echo "   5. Submit to hackathon!"
        echo ""
    else
        echo ""
        echo "❌ Push failed. Common issues:"
        echo "   - Authentication required (use 'gh auth login' or personal access token)"
        echo "   - Repository doesn't exist (create it on GitHub first)"
        echo "   - Network issues (check your connection)"
        echo ""
        echo "Try manual push:"
        echo "   git push public main --force"
    fi
else
    echo "❌ Push cancelled"
fi

echo ""
echo "Done! 🎉"

# Made with Bob
