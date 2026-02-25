# Todo Overlay Update Server

This directory contains the update server structure for Tauri auto-updates.

## Structure

```
updates/
├── releases.json              # Version manifest
├── darwin-aarch64/           # macOS ARM64 builds
├── darwin-x86_64/            # macOS x86_64 builds
├── windows-x86_64/           # Windows x64 builds
└── linux-x86_64/             # Linux x64 builds
```

## Usage

1. Build the application with `npm run tauri build`
2. Copy the update artifacts to the appropriate platform directory
3. Update `releases.json` with the new version info and signatures
4. The updater will automatically check this endpoint

## Generating Signatures

To sign releases, you need a signing key:

```bash
cd src-tauri
tauri signer generate -w ~/.tauri/todo-overlay.key
```

Keep the private key secure and use it to sign release artifacts:

```bash
tauri signer sign /path/to/app.tar.gz --private-key ~/.tauri/todo-overlay.key
```

## Docker Deployment

This directory is mounted as read-only in the Docker container at `/usr/share/nginx/html/updates/`.
