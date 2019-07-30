#!/bin/bash

set -e

cd $(dirname "${BASH_SOURCE[0]}")

CHANGES=$(git diff --name-only)
CHANGES_COUNT=0

for i in ${CHANGES[@]}; do
    CHANGES_COUNT=$((CHANGES_COUNT+1))
done

[ ${CHANGES_COUNT} -eq 0 ] || git stash
git pull
[ ${CHANGES_COUNT} -eq 0 ] || git stash pop

git add src/contributions.json

git commit -m"Automatic API data update"
git push origin HEAD
