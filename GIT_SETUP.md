# Git Setup Guide

## 1. Install Git

1. Download Git for Windows from [Git SCM](https://git-scm.com/download/win)
2. Run the installer and follow the setup wizard
3. Accept the default settings unless customization is needed
4. Restart your terminal or PowerShell after installation

## 2. Configure Git

After installation, open a terminal and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 3. Initialize a Repository

To initialize Git in your project directory:

1. Open the terminal in the project root
2. Run:

```bash
git init
git add .
git commit -m "Initial commit: Project setup"
```

## 4. Best Practices

- Ensure that `.gitignore` files are correctly set up
- Never commit sensitive data such as `.env` files
- Each project component (frontend, backend, client) should have a proper `.gitignore`

## 5. Pushing to a Remote Repository

1. Create a repository on GitHub, GitLab, or Bitbucket
2. Link the remote repository:

```bash
git remote add origin <repository-url>
git branch -M main
git push -u origin main
```

## 6. Next Steps

- Regularly commit and push changes
- Use branches for new features or fixes
- Keep your local repository updated with `git pull`
