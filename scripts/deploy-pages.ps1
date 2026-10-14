# Manual GitHub Pages deploy (no GitHub Actions workflow scope required)
$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path "$root\client\package.json")) { $root = Split-Path $PSScriptRoot -Parent }
Set-Location "$root\client"
$env:GITHUB_PAGES = 'true'
if (-not $env:VITE_API_URL) { $env:VITE_API_URL = 'https://medicine-availability-api.onrender.com' }
npm ci
npm run build
$tmp = Join-Path $env:TEMP "maf-pages-deploy"
Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $tmp | Out-Null
Copy-Item -Path "dist\*" -Destination $tmp -Recurse
New-Item -Path "$tmp\.nojekyll" -ItemType File -Force | Out-Null
Set-Location $tmp
if (-not (Test-Path .git)) { git init -b gh-pages }
git add index.html assets .nojekyll
git commit -m "Deploy Medicine Availability Finder (GitHub Pages)" --allow-empty
git remote remove origin 2>$null
git remote add origin https://github.com/prajwalrajjj/medicine-availability-finder.git
git push -f origin gh-pages
Write-Host "Live site: https://prajwalrajjj.github.io/medicine-availability-finder/"
