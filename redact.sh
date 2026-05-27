original_commit=$(git rev-parse HEAD)

FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch \
  --index-filter 'git rm --cached -r .' \
  --commit-filter 'git commit-tree -m "[REDACTED]" "$@"' \
  --tag-name-filter cat \
  -- --all

git checkout $original_commit -- .
git add -A
git commit -m "clean"
git push --force