cd ~/Cloud-Agent

# (optional) confirm the files exist locally now
ls -la
ls -la packrunner tests

git add packrunner tests .gitignore
git commit -m "Add PackRunner code (backend + static UI + tests)"
git push
