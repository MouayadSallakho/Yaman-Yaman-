# Build Fix Notes

## Fixed source error

`react-icons/fi` does not export `FiRocket` in the installed `react-icons` version.
The Brand Showcase used that invalid export in two files.

The implementation now uses the valid Feather icon `FiZap` for the existing `rocket` semantic key, preserving the data contract and visual intent.

Updated files:

- `src/components/landing/BrandShowcase/BrandBenefitsStrip.jsx`
- `src/components/landing/BrandShowcase/FeaturedBrandCard.jsx`

## Windows dependency reset

The `EPERM ... next-swc.win32-x64-msvc.node` error means a running Node/Next.js process is locking the native SWC file. Stop all Node processes before reinstalling dependencies.

Run from PowerShell in the project folder:

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm cache verify
npm ci
npm run lint
npm run build
npm run dev
```

If Windows still denies deletion, close VS Code terminals and browser tabs using the dev server, then reopen PowerShell as Administrator and repeat the commands.
