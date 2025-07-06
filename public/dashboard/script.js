document.addEventListener('DOMContentLoaded', function () {
    const dashboardBtn = document.getElementById('dashboardBtn');
    const mealsBtn = document.getElementById('mealsBtn');
    const trackerBtn = document.getElementById('trackerBtn');
    const exerciseBtn = document.getElementById('exerciseBtn');
    const profileBtn = document.getElementById('profileBtn');
    const scannerModal = document.getElementById('scannerModal');
    const closeScanner = document.querySelector('.close-scanner');
    const flashlightBtn = document.getElementById('flashlightBtn');
    const videoElement = document.getElementById('qr-video');
    const scanFeedback = document.getElementById('scan-feedback') || document.createElement('div');

    const scanBtn = document.createElement('button');
    scanBtn.className = 'floating-scan-btn';
    scanBtn.id = 'scanBtn';
    scanBtn.innerHTML = '<i class="fas fa-qrcode"></i>';
    document.body.appendChild(scanBtn);

    dashboardBtn?.addEventListener('click', () => window.location.href = '/dashboard/index.html');
    mealsBtn?.addEventListener('click', () => window.location.href = '../meal/meal.html');
    trackerBtn?.addEventListener('click', () => window.location.href = '../tracker/tracker.html');
    exerciseBtn?.addEventListener('click', () => window.location.href = '../exercise/exercise.html');
    profileBtn?.addEventListener('click', () => window.location.href = '../profile/profile.html');

    scanBtn?.addEventListener('click', openScannerModal);
    closeScanner?.addEventListener('click', closeScannerModal);
    flashlightBtn?.addEventListener('click', toggleFlashlight);

    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) loadUserProfileIntoDashboard();

    const mealPlanSection = document.querySelector('.meal-plan-section');
    if (mealPlanSection) loadMealPlanSection();

    let lastDetectedCode = null;
    let lastDetectionTime = 0;
    let flashlightOn = false;

    function startScanner() {
        Quagga.init({
            inputStream: {
                type: 'LiveStream',
                target: videoElement,
                constraints: { facingMode: 'environment' }
            },
            decoder: {
                readers: ['ean_reader', 'upc_reader', 'code_128_reader']
            }
        }, function (err) {
            if (err) {
                console.error('Quagga init error:', err);
                showScanFeedback('Scanner init failed', 'error');
                return;
            }
            Quagga.start();
            showScanFeedback('Scanner ready...', 'info');
        });

        Quagga.onDetected(handleBarcodeDetection);
    }

    function handleBarcodeDetection(result) {
        const now = Date.now();
        const code = result.codeResult.code;
        const format = result.codeResult.format;

        if (code === lastDetectedCode && now - lastDetectionTime < 2000) return;

        lastDetectedCode = code;
        lastDetectionTime = now;

        playBeepSound();
        stopScanner();
        showScanFeedback(`Detected: ${code}`, 'success');

        fetch('/api/product-lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: code, format })
        })
        .then(res => res.json())
        .then(data => {
            localStorage.setItem('lastScannedProduct', JSON.stringify(data));
            window.location.href = 'Product_Info.html';
        })
        .catch(err => {
            showScanFeedback('Lookup failed. Try again.', 'error');
            console.error(err);
            setTimeout(() => startScanner(), 3000);
        });
    }

    function stopScanner() {
        Quagga?.stop();
        if (videoElement?.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
    }

    function openScannerModal() {
        scannerModal?.classList.add('show');
        startScanner();
    }

    function closeScannerModal() {
        scannerModal?.classList.remove('show');
        stopScanner();
    }

    function playBeepSound() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 800;
        osc.connect(audioCtx.destination);
        osc.start();
        setTimeout(() => osc.stop(), 100);
    }

    async function toggleFlashlight() {
        const track = videoElement?.srcObject?.getVideoTracks()[0];
        if (!track) return;

        try {
            if (track.getCapabilities().torch) {
                flashlightOn = !flashlightOn;
                await track.applyConstraints({ advanced: [{ torch: flashlightOn }] });
                flashlightBtn.innerHTML = flashlightOn
                    ? '<i class="fas fa-bolt"></i> Turn Off Flashlight'
                    : '<i class="fas fa-bolt"></i> Turn On Flashlight';
            } else {
                showScanFeedback('Flashlight not available', 'error');
            }
        } catch (err) {
            console.error(err);
            showScanFeedback('Flashlight toggle failed', 'error');
        }
    }

    function showScanFeedback(msg, type) {
        if (!scanFeedback.id) {
            scanFeedback.id = 'scan-feedback';
            scanFeedback.className = 'scan-feedback';
            document.querySelector('.scanner-content')?.appendChild(scanFeedback);
        }
        scanFeedback.textContent = msg;
        scanFeedback.className = `scan-feedback ${type}`;
        scanFeedback.style.display = 'block';
    }

    window.addEventListener('click', e => {
        if (e.target === scannerModal) closeScannerModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && scannerModal?.classList.contains('show')) {
            closeScannerModal();
        }
    });
});

async function loadUserProfileIntoDashboard() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const res = await fetch(`/api/user/${userId}`);
        const data = await res.json();

        localStorage.setItem('nutriTrackUserProfile', JSON.stringify(data));

        const welcomeEl = document.querySelector('.welcome-message');
        const calorieEl = document.querySelector('.calories-stat');
        const calorieBar = document.querySelectorAll('.progress')[0];

        const waterEl = document.querySelector('.water-stat');
        const waterBar = document.querySelectorAll('.progress')[1];

        const stepEl = document.querySelector('.steps-stat');
        const stepBar = document.querySelectorAll('.progress')[2];

        if (welcomeEl && data.name) welcomeEl.textContent = `Welcome Back, ${data.name}!`;

        const goals = data.goals || {};
        const { dailyCalories, dailyWaterGlasses, dailySteps } = goals;

        if (calorieEl && dailyCalories) calorieEl.textContent = `0 / ${dailyCalories} kcal`;
        if (calorieBar && dailyCalories) calorieBar.style.width = `0%`;

        if (waterEl && dailyWaterGlasses) waterEl.textContent = `0 / ${dailyWaterGlasses} glasses`;
        if (waterBar && dailyWaterGlasses) waterBar.style.width = `0%`;

        if (stepEl && dailySteps) stepEl.textContent = `0 / ${dailySteps} steps`;
        if (stepBar && dailySteps) stepBar.style.width = `0%`;

    } catch (err) {
        console.error('Failed to load user profile into dashboard:', err);
    }
}

function hashStringToIndex(str, max) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % max;
}
async function loadMealPlanSection() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const res = await fetch(`/api/meals/${userId}`);
        const meals = await res.json();

        const container = document.querySelector('.meal-cards');
        if (!container) return;

        container.innerHTML = '';


    // Group meals by type
    const groupedMeals = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: []
    };

    meals.forEach(meal => {
      const type = meal.mealType;
      if (groupedMeals[type]) groupedMeals[type].push(meal);
    });

    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD


    // Loop through each meal type and append one random meal
    ['Breakfast', 'Lunch', 'Dinner', 'Snack'].forEach(type => {
       const mealsOfType = groupedMeals[type];
      if (mealsOfType.length > 0) {
        const index = hashStringToIndex(today + type + userId, mealsOfType.length);
        const meal = mealsOfType[index];

        const totalCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
        const totalProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
        const totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
        const totalFat = meal.foods.reduce((sum, food) => sum + food.fat, 0);

        const card = document.createElement('div');
        card.className = 'meal-card';
        card.innerHTML = `
          <div class="meal-time">${meal.mealType}</div>
          <div class="meal-content">
            <h3>${meal.foods[0]?.name || 'Meal'}</h3>
            <p>${meal.foods.map(f => f.name).join(', ')}</p>
            <div class="meal-nutrition">
              ${totalCalories} kcal | Protein: ${totalProtein}g | Carbs: ${totalCarbs}g | Fat: ${totalFat}g
            </div>
          </div>
        `;
        container.appendChild(card);
      }
    });
  } catch (err) {
    console.error('Failed to load meals:', err);
  }
}