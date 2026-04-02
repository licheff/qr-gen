# QR Code Generator

A simple, single-page QR code generator that exports to SVG format.

## Features

- Generate QR codes from URLs
- Export as pure vector SVG (scalable, editable)
- No build process required—just open `index.html` in a browser
- Minimal dependencies (all via CDN)
- Clean, simple UI

## How to use

1. Open `index.html` in your browser
2. Enter a URL
3. Click "Generate QR Code"
4. Click "Download as SVG" to save

## Files

- `index.html` - Main page
- `script.js` - QR code generation and download logic
- `README.md` - This file

## Libraries used

- **qr-code-styling** - Generates QR codes as native SVG (vector format)
- **Tailwind CSS** - Styling (via CDN)

## To deploy

1. Upload all files to your web server
2. Set up DNS for `qr.licheff.cc`
3. Point it to your hosting

The static files are ready to serve as-is. No build step, no backend needed.
