document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const downloadPngBtn = document.getElementById('download-png-btn');
    const qrOutput = document.getElementById('qr-output');

    let exportedSvg = '';
    let exportedSvgTransparent = '';

    urlInput.focus();

    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadSVG);
    downloadPngBtn.addEventListener('click', downloadPNG);

    urlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') generateQRCode();
    });

    function generateQRCode() {
        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        if (!isValidUrl(url)) {
            alert('Please enter a valid URL');
            return;
        }

        qrOutput.innerHTML = '';

        try {
            const qr = qrcode(0, 'M');
            qr.addData(url);
            qr.make();

            exportedSvg = buildSvg(qr, 300);
            exportedSvgTransparent = buildSvg(qr, 300, true);
            qrOutput.innerHTML = exportedSvg;
            downloadBtn.disabled = false;
            downloadPngBtn.disabled = false;
        } catch (error) {
            exportedSvg = '';
            exportedSvgTransparent = '';
            downloadBtn.disabled = true;
            downloadPngBtn.disabled = true;
            alert('Error generating QR code: ' + error.message);
        }
    }

    // `transparent` skips the white background rect — used for PNG export so the
    // exported file has a see-through background instead of a white square.
    function buildSvg(qr, size, transparent = false) {
        const moduleCount = qr.getModuleCount();
        const cellSize = size / moduleCount;
        // Quiet zone: empty breathing room around the modules so scanners can
        // lock on. Proportional (~2% of size) so it looks the same at every
        // export size. The modules are inset by `margin` and the canvas grows
        // by `margin` on all four sides.
        const margin = size * 0.02;
        const totalSize = size + margin * 2;
        const pathData = [];

        for (let row = 0; row < moduleCount; row += 1) {
            let runStart = null;

            for (let col = 0; col < moduleCount; col += 1) {
                const isDark = qr.isDark(row, col);

                if (isDark && runStart === null) {
                    runStart = col;
                }

                if ((!isDark || col === moduleCount - 1) && runStart !== null) {
                    const runEnd = isDark && col === moduleCount - 1 ? col + 1 : col;
                    const x = formatNumber(runStart * cellSize + margin);
                    const y = formatNumber(row * cellSize + margin);
                    const width = formatNumber((runEnd - runStart) * cellSize);
                    const height = formatNumber(cellSize);

                    pathData.push(`M${x} ${y}h${width}v${height}H${x}z`);
                    runStart = null;
                }
            }
        }

        return [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}" role="img" aria-label="QR code">`,
            transparent ? '' : '<rect width="100%" height="100%" fill="#ffffff"/>',
            `<path d="${pathData.join('')}" fill="#000000"/>`,
            '</svg>'
        ].join('');
    }

    function formatNumber(value) {
        return Number(value.toFixed(4));
    }

    function downloadSVG() {
        if (!exportedSvg) return;

        try {
            const blob = new Blob([exportedSvg], { type: 'image/svg+xml;charset=utf-8' });
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = blobUrl;
            link.download = `qr-code-${Date.now()}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            alert('Error downloading SVG: ' + error.message);
        }
    }

    function downloadPNG() {
        if (!exportedSvgTransparent) return;

        // Fixed export size — large enough to stay crisp when scaled up, since
        // PNG is fixed-pixel unlike the resolution-independent SVG.
        const pngSize = 1024;

        const svgBlob = new Blob([exportedSvgTransparent], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const image = new Image();

        image.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = pngSize;
                canvas.height = pngSize;

                // No fillRect — leaving the canvas untouched keeps the background
                // transparent, which carries through to the exported PNG.
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, pngSize, pngSize);

                canvas.toBlob((blob) => {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');

                    link.href = blobUrl;
                    link.download = `qr-code-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                }, 'image/png');
            } catch (error) {
                alert('Error downloading PNG: ' + error.message);
            } finally {
                URL.revokeObjectURL(svgUrl);
            }
        };

        image.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            alert('Error rendering QR code for PNG export');
        };

        image.src = svgUrl;
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});
