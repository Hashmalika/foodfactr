
// profile.js - Save and load user profile from backend and localStorage

document.addEventListener('DOMContentLoaded', function () {
    const profileForm = document.getElementById('profile-form');
    const nameInput = document.getElementById('name');

    if (profileForm) {
        profileForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = new FormData(profileForm);

            const profileData = {
                allergies: [],
                diseases: [],
                goals: {}
            };

            for (const [key, value] of formData.entries()) {
                if (key === 'allergies' || key === 'diseases') {
                    profileData[key].push(value);
                } else if (key === 'dailyCalories' || key === 'dailyWaterGlasses' || key === 'dailySteps') {
                    profileData.goals[key] = value;
                } else {
                    profileData[key] = value;
                }
            }

            try {
                const res = await fetch('/api/user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profileData)
                });

                const data = await res.json();

                if (data?._id) {
                    localStorage.setItem('userId', data._id);
                    localStorage.setItem('nutriTrackUserProfile', JSON.stringify(data));
                    alert('Profile saved successfully!');
                    window.location.href = '../dashboard/index.html';
                } else {
                    alert('Failed to save profile');
                    console.error('No _id returned from backend:', data);
                }
            } catch (err) {
                console.error('Failed to save profile:', err);
                alert('Error saving profile');
            }
        });
    }

    // Load existing profile if editing
    if (nameInput) {
        const saved = localStorage.getItem('nutriTrackUserProfile');
        if (saved) {
            const data = JSON.parse(saved);

            // Flat fields
            for (const key in data) {
                if (typeof data[key] === 'string') {
                    const el = document.getElementById(key);
                    if (el) el.value = data[key];
                }
            }

            // Load nested goals if they exist
            if (data.goals) {
                for (const goalKey in data.goals) {
                    const goalInput = document.getElementById(goalKey);
                    if (goalInput) goalInput.value = data.goals[goalKey];
                }
            }

            // Checkboxes
            ['allergies', 'diseases'].forEach(field => {
                (data[field] || []).forEach(val => {
                    const checkbox = document.querySelector(`input[name="${field}"][value="${val}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            });
        }
    }
});
