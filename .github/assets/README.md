# Screenshots & Assets

This directory contains screenshots and visual assets for the project README and documentation.

## Adding Screenshots

When adding screenshots, please:

1. **Naming Convention**: Use descriptive names
   - `app-main-window.png` - Main application window
   - `app-dark-mode.png` - Dark mode screenshot
   - `app-light-mode.png` - Light mode screenshot
   - `app-settings.png` - Settings page
   - `app-subtasks.png` - Subtasks feature
   - `demo.gif` - Animated demo

2. **Image Specifications**:
   - **Format**: PNG for screenshots, GIF for animations
   - **Size**: Max 1920x1080 resolution
   - **Compression**: Optimize images before committing
   - **File size**: Keep under 500KB per image

3. **Content Guidelines**:
   - Use dummy/example data (no personal info)
   - Show actual app features
   - Use consistent theme (prefer dark mode)
   - Crop to relevant areas

## Tools for Screenshots

### macOS
- `Cmd+Shift+4` - Take selection screenshot
- Use Preview to resize/crop

### Windows
- `Win+Shift+S` - Snipping tool
- Use Paint or GIMP to edit

### Linux
- `gnome-screenshot` - GNOME screenshot tool
- Use GIMP to edit

## Compression Tools

- [TinyPNG](https://tinypng.com/) - Compress PNG files
- [EZGIF](https://ezgif.com/optimize) - Compress GIF files
- [Squoosh](https://squoosh.app/) - Web-based image optimizer

## Usage in README

Reference images in README.md like this:

```markdown
![App Screenshot](.github/assets/app-main-window.png)
```

Or use HTML for more control:

```html
<img src=".github/assets/app-main-window.png" alt="Todo Overlay Main Window" width="800">
```

## Current Assets

- ✅ `.github/assets/README.md` - This file
- ⏳ Add screenshots here once the app UI is ready

## TODO

- [ ] Capture main window screenshot (dark mode)
- [ ] Capture main window screenshot (light mode)
- [ ] Capture settings page
- [ ] Capture subtasks feature
- [ ] Create animated demo GIF showing hotkey usage
- [ ] Create banner/logo for social media

