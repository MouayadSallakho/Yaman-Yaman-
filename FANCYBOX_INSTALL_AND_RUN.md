# XIOMA X15 Ultra - Fancybox installation and run guide

This project intentionally uses the official `@fancyapps/ui` package for the XIOMA X15 Ultra product gallery.

## Requirements

- Node.js 20.9.0 or newer
- npm
- Internet access to `https://registry.npmjs.org/` during the first installation

## Clean installation

Extract the ZIP into a new folder. Do not reuse or copy an old `node_modules` directory.

Open PowerShell in the `Mabco` folder and run one command at a time:

```powershell
node --version
npm --version
npm install
npm run dev
```

Open:

```text
http://localhost:3000/products/xioma-x15-ultra
```

## Validation

```powershell
npm run lint
npm run build
```

## If npm reports ETIMEDOUT

The project includes a `.npmrc` with extended npm retry and timeout settings. If the download still times out:

1. Close VPN or proxy software.
2. Try another network or a mobile hotspot.
3. Run `npm ping`.
4. Run `npm install` again.

Do not remove `@fancyapps/ui`; it is the intended lightbox library for this demo.

## Fancybox license

`@fancyapps/ui` is commercial software. Review the Fancyapps license before using this implementation in a production or commercial deployment.
