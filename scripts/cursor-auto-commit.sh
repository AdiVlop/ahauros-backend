#!/bin/bash
set -e

ORG="PayAiX"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
REPO_NAME=$(basename -s .git `git config --get remote.origin.url` | xargs basename)

NEW_REMOTE="git@github.com:${ORG}/${REPO_NAME}.git"
CURRENT_REMOTE=$(git remote get-url origin)

# 🔍 Verific remote
if [[ "$CURRENT_REMOTE" != *"$ORG"* ]]; then
  echo "⚠️ Remote vechi: $CURRENT_REMOTE"
  echo "➡️ Setez remote la $NEW_REMOTE"
  git remote set-url origin "$NEW_REMOTE"
else
  echo "✅ Remote corect: $CURRENT_REMOTE"
fi

# 📦 Auto-commit
git add .
MSG="Auto commit from Cursor ($(date +'%Y-%m-%d %H:%M:%S'))"
git commit -m "$MSG" || echo "ℹ️ Nimic de commitat"

echo "🚀 Fac push pe branch $BRANCH..."
git push origin "$BRANCH"
