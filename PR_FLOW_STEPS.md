# Flow: Make something-new = main, then reapply your code for a clean PR

## Step 1: Backup current code to copy-dir (do this first)

Run in Terminal (outside this repo):

```bash
# Remove old backup if any, then copy current repo contents into copy-dir
rm -rf "/Users/raman.sharma/Documents/copy-dir"
cp -a "/Users/raman.sharma/Documents/outBoundCaller 1" "/Users/raman.sharma/Documents/copy-dir"
```

So `copy-dir` is a full copy of `outBoundCaller 1` (your current something-new code).

---

## Step 2: Make something-new match main (run in repo)

Already done for you via script, or run:

```bash
cd "/Users/raman.sharma/Documents/outBoundCaller 1"
git fetch origin
git checkout something-new
git reset --hard origin/main
```

After this, the folder will contain only what’s on **main** (your previous code is gone from the repo; it’s safe in copy-dir).

---

## Step 3: Copy your code back from copy-dir

Run in Terminal:

```bash
# Copy contents of copy-dir into outBoundCaller 1 (preserve your code)
cp -a "/Users/raman.sharma/Documents/copy-dir/." "/Users/raman.sharma/Documents/outBoundCaller 1/"
```

If you get permission denied, fix permissions first:

```bash
sudo chown -R $(whoami) "/Users/raman.sharma/Documents/outBoundCaller 1"
```

Then run the `cp` again.

---

## Step 4: Commit and push something-new

```bash
cd "/Users/raman.sharma/Documents/outBoundCaller 1"
git add -A
git status   # check that your files are listed
git commit -m "Add outbound caller app (full code)"
git push --force-with-lease origin something-new
```

---

## Step 5: Open PR on GitHub

- **Base:** `main`
- **Compare:** `something-new`

The PR will show all your code as the diff. Merge when ready.
