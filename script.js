document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const qrOutput = document.getElementById('qr-output');
    
    let qrCode = null;

    urlInput.focus();

    generateBtn.addEventListener('click', generateQRCode);
    downloadBtn.addEventListener('click', downloadSVG);
    
    // Allow Enter key to generate
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateQRCode();
    });

    function generateQRCode() {
        const url = urlInput.value.trim();
        
        // Basic validation
        if (!url) {
            alert('Please enter a URL');
            return;
        }
        
        if (!isValidUrl(url)) {
            alert('Please enter a valid URL');
            return;
        }
        
        // Clear previous QR code
        qrOutput.innerHTML = '';
        
        try {
            // Create or update QR code - generates pure SVG
            qrCode = new QRCodeStyling({
                type: 'svg',
                width: 300,
                height: 300,
                data: url,
                dotsOptions: {
                    color: '#000000',
                    type: 'square'
                },
                backgroundOptions: {
                    color: '#ffffff'
                },
                margin: 0
            });
            
            qrCode.append(qrOutput);
            downloadBtn.disabled = false;
        } catch (error) {
            alert('Error generating QR code: ' + error.message);
            downloadBtn.disabled = true;
        }
    }

    function downloadSVG() {
        if (!qrCode) return;
        
        try {
            qrCode.download({
                extension: 'svg',
                name: `qr-code-${Date.now()}`
            });
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
