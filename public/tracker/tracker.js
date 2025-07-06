// tracker.js - Fetch and display nutrition tracking data from /api/tracker

document.addEventListener('DOMContentLoaded', async function () {
    const statsContainer = document.querySelector('.stats-container');

    if (!statsContainer) return;

    try {
        const res = await fetch('/api/tracker');
        const data = await res.json();

        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-fire"></i></div>
                <div class="stat-info">
                    <h3>Daily Calories</h3>
                    <p>${data.calories} / ${data.goalCalories} kcal</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(data.calories / data.goalCalories) * 100}%"></div>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-tint"></i></div>
                <div class="stat-info">
                    <h3>Water Intake</h3>
                    <p>${data.water} / 8 glasses</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(data.water / 8) * 100}%"></div>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-walking"></i></div>
                <div class="stat-info">
                    <h3>Steps</h3>
                    <p>${data.steps} / 10000 steps</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(data.steps / 10000) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        console.error('Error loading tracker data:', err);
        statsContainer.innerHTML = `<p class="error">Failed to load tracker stats.</p>`;
    }
});
