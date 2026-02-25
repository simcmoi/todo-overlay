# Todo Overlay - Web Infrastructure

This directory contains the landing page and update server for Todo Overlay.

## Structure

```
web/
├── landing/           # React landing page with Tailwind + shadcn/ui + Framer Motion
│   ├── Dockerfile     # Multi-stage build for production
│   ├── nginx.conf     # Nginx configuration for SPA + updates
│   └── src/           # Source code
└── updates/           # Tauri update server
    ├── releases.json  # Version manifest
    └── [platforms]/   # Build artifacts per platform
```

## Development

### Landing Page

```bash
cd web/landing
npm install
npm run dev
```

The landing page will be available at http://localhost:5173

### Building

```bash
cd web/landing
npm run build
```

## Docker Deployment

### Build and Run

```bash
# From the project root
docker-compose up -d
```

This will:
1. Build the landing page React app
2. Create a production Nginx container
3. Serve the landing page at http://localhost
4. Mount the updates directory at `/updates/`

### Stop

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f web
```

## Update Server

The update server is a static file server that serves:
- `releases.json` - Version manifest
- Platform-specific build artifacts

### Adding New Releases

1. Build the Tauri app: `npm run tauri build`
2. Sign the artifacts:
   ```bash
   tauri signer sign path/to/artifact.tar.gz --private-key ~/.tauri/todo-overlay.key
   ```
3. Copy artifacts to the appropriate platform directory:
   - `darwin-aarch64/` - macOS ARM64
   - `darwin-x86_64/` - macOS Intel
   - `windows-x86_64/` - Windows
   - `linux-x86_64/` - Linux
4. Update `releases.json` with new version, signatures, and URLs

### Example releases.json

```json
{
  "version": "0.2.0",
  "date": "2026-02-25",
  "notes": "Release notes in markdown",
  "platforms": {
    "darwin-aarch64": {
      "signature": "BASE64_SIGNATURE",
      "url": "https://example.com/updates/darwin-aarch64/app.tar.gz"
    }
  }
}
```

## Nginx Configuration

The nginx.conf handles:
- SPA routing for the landing page
- Static file serving for `/updates/`
- CORS headers for update checks
- Gzip compression
- Cache control headers
- Security headers

## Production Deployment

### Prerequisites

- Domain name (e.g., todo-overlay.com)
- Server with Docker installed
- SSL certificate (Let's Encrypt recommended)

### SSL Setup with Let's Encrypt

1. Install Certbot:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Get certificate:
   ```bash
   sudo certbot --nginx -d todo-overlay.com
   ```

3. Update docker-compose.yml to mount certificates:
   ```yaml
   volumes:
     - ./web/updates:/usr/share/nginx/html/updates:ro
     - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

4. Update nginx.conf to use SSL (port 443)

### Environment Variables

Create a `.env` file in the project root:

```env
DOMAIN=todo-overlay.com
```

## Landing Page Features

- **Hero Section**: Animated introduction with download button
- **Features Section**: Grid of 8 key features with icons
- **Download Section**: Auto-detects user OS and suggests appropriate download
- **Footer**: Links to GitHub, version info
- **Animations**: Framer Motion for smooth interactions
- **Responsive**: Mobile-first design
- **Dark Mode**: Supports system preference

## Monitoring

### Check if service is running

```bash
docker-compose ps
```

### Check Nginx access logs

```bash
docker-compose exec web tail -f /var/log/nginx/access.log
```

### Check Nginx error logs

```bash
docker-compose exec web tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Port already in use

If port 80/443 is already in use:

```bash
# Find what's using the port
sudo lsof -i :80

# Stop the service or change docker-compose.yml ports
```

### Container won't start

```bash
# Check logs
docker-compose logs web

# Rebuild
docker-compose build --no-cache web
docker-compose up -d
```

### Updates not working

1. Check releases.json is accessible: http://localhost/updates/releases.json
2. Verify CORS headers are present
3. Check file permissions on updates directory
4. Ensure signatures match the artifacts

## License

MIT - See main project LICENSE file
