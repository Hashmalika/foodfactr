// scanner.js

document.addEventListener('DOMContentLoaded', function () {
    const scannerModal = document.getElementById('scannerModal');
    const closeScanner = document.querySelector('.close-scanner');
    const flashlightBtn = document.getElementById('flashlightBtn');
    const videoElement = document.getElementById('qr-video');
    const scanFeedback = document.getElementById('scan-feedback') || document.createElement('div');

    let lastDetectedCode = null;
    let lastDetectionTime = 0;
    let flashlightOn = false;

    function showScanFeedback(message, type = 'info') {
        if (!scanFeedback.id) {
            scanFeedback.id = 'scan-feedback';
            scanFeedback.className = 'scan-feedback';
            const scannerContent = document.querySelector('.scanner-content');
            if (scannerContent) {
                scannerContent.appendChild(scanFeedback);
            }
        }
        scanFeedback.textContent = message;
        scanFeedback.className = `scan-feedback ${type}`;
        scanFeedback.style.display = 'block';
    }

    function playBeepSound() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 100);
    }

    function lookupProduct(barcode, format) {
        showScanFeedback(`Looking up product ${barcode}...`, 'info');

        fetch('/api/product-lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ barcode, format })
        })
        .then(response => response.json())
        .then(productData => {
            localStorage.setItem('lastScannedProduct', JSON.stringify(productData));
            window.location.href = 'Product_Info.html';
        })
        .catch(err => {
            console.error('Lookup failed:', err);
            showScanFeedback('Product lookup failed. Try again or enter manually.', 'error');

            setTimeout(() => {
                if (scannerModal.classList.contains('show')) {
                    startScanner();
                }
            }, 3000);
        });
    }

    function handleBarcodeDetection(result) {
        const currentTime = new Date().getTime();
        const code = result.codeResult.code;
        const format = result.codeResult.format;

        if (code === lastDetectedCode && currentTime - lastDetectionTime < 2000) return;

        lastDetectedCode = code;
        lastDetectionTime = currentTime;

        playBeepSound();
        stopScanner();
        showScanFeedback(`Detected: ${code} (${format})`, 'success');
        lookupProduct(code, format);
    }

    function startScanner() {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: videoElement,
                constraints: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
            },
            decoder: {
                readers: [
                    "ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader",
                    "code_128_reader", "code_39_reader", "code_93_reader",
                    "codabar_reader", "i2of5_reader"
                ]
            },
            locate: true
        }, err => {
            if (err) {
                console.error(err);
                showScanFeedback('Camera init failed.', 'error');
                return;
            }
            Quagga.start();
            showScanFeedback('Scanner ready. Point camera at barcode.', 'info');
        });

        Quagga.onDetected(handleBarcodeDetection);
    }

    function stopScanner() {
        try {
            Quagga.stop();
        } catch (e) {
            console.error('Stop error:', e);
        }

        if (videoElement?.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    }

    async function toggleFlashlight() {
        if (!videoElement?.srcObject) return;
        const track = videoElement.srcObject.getVideoTracks()[0];

        try {
            if (track.getCapabilities().torch) {
                flashlightOn = !flashlightOn;
                await track.applyConstraints({ advanced: [{ torch: flashlightOn }] });
                flashlightBtn.innerHTML = flashlightOn
                    ? '<i class="fas fa-bolt"></i> Turn Off Flashlight'
                    : '<i class="fas fa-bolt"></i> Turn On Flashlight';
            } else {
                showScanFeedback('Flashlight not available.', 'error');
            }
        } catch (err) {
            console.error(err);
            showScanFeedback('Flashlight toggle failed.', 'error');
        }
    }

    function openScannerModal() {
        scannerModal.classList.add('show');
        startScanner();
    }

    function closeScannerModal() {
        scannerModal.classList.remove('show');
        stopScanner();
    }

    document.getElementById('scanBtn')?.addEventListener('click', openScannerModal);
    closeScanner?.addEventListener('click', closeScannerModal);
    flashlightBtn?.addEventListener('click', toggleFlashlight);

    window.addEventListener('click', e => {
        if (e.target === scannerModal) closeScannerModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && scannerModal.classList.contains('show')) {
            closeScannerModal();
        }
    });
});
