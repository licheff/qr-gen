document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const qrOutput = document.getElementById('qr-output');

    let exportedSvg = '';

    urlInput.focus();

    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadSVG);

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
            qrOutput.innerHTML = exportedSvg;
            downloadBtn.disabled = false;
        } catch (error) {
            exportedSvg = '';
            downloadBtn.disabled = true;
            alert('Error generating QR code: ' + error.message);
        }
    }

    function buildSvg(qr, size) {
        const moduleCount = qr.getModuleCount();
        const cellSize = size / moduleCount;
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
                    const x = formatNumber(runStart * cellSize);
                    const y = formatNumber(row * cellSize);
                    const width = formatNumber((runEnd - runStart) * cellSize);
                    const height = formatNumber(cellSize);

                    pathData.push(`M${x} ${y}h${width}v${height}H${x}z`);
                    runStart = null;
                }
            }
        }

        return [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="QR code">`,
            '<rect width="100%" height="100%" fill="#ffffff"/>',
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

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});
