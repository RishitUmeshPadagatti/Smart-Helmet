# Contributing Guidelines

Welcome! Before contributing to this project, **please read these instructions carefully** to ensure smooth collaboration and avoid breaking the codebase.

---

## 🚫 Never Work on the `main` Branch
`main` is our production-ready branch.  
**Do NOT write code, commit, or push directly to `main` under ANY circumstances.**  
Always create your own feature branch before making any changes.

---

## ⭐ Step-by-Step Contribution Workflow

### 1. Clean your local repository
Before starting new work, delete any old local branches that have already been pushed and merged.

```
git branch --merged
git branch -d <branch-name>
```

Only keep branches you are currently working on.

---

### 2. Pull the latest `main` branch
Always sync with the newest version of the project.

```
git checkout main
git pull origin main
```

---

### 3. Create a new feature branch
Branch names should be clear and meaningful.

Examples:
- feature/login-ui 
- rishit 
- bugfix/navbar-overlap  
- docs/update-readme

Create your branch:

```
git checkout -b feature/your-branch-name
```

---

### 4. Write code and commit regularly

```
git add .
git commit -m "Add: user authentication API"
```

---

### 5. Push your feature branch

```
git push origin feature/your-branch-name
```

GitHub will show a button to create a Pull Request (PR).

---

### 6. Create a Pull Request (PR)
In your PR:
- Describe what you changed  
- Mention any related issues  
- Request reviews if needed  

**Merge it into `main` on GitHub**.

---

### 7. Delete your branch after merge
On GitHub, click **Delete Branch** after merging.

Then remove it locally as well:

```
git branch -d feature/your-branch-name
```

---

## 🔁 After Every Merge → Sync Again
Before starting any new work:

```
git checkout main
git pull origin main
```

Always begin with the fresh `main` branch.

---

## Summary

- **Never work directly on `main`.**  
- **Always pull `main` before creating a new branch.**  
- **Use feature branches for all work.**  
- **Push → PR → Merge → Delete branch.**  
- **Clean old local branches regularly.**