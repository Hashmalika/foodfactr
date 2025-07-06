document.addEventListener('DOMContentLoaded', function () {
  
  
  
  const mealsBtn = document.getElementById('mealsBtn');
  const trackerBtn = document.getElementById('trackerBtn');
  const exerciseBtn = document.getElementById('exerciseBtn');
  const profileBtn = document.getElementById('profileBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');

  dashboardBtn?.addEventListener('click', () => window.location.href = '/dashboard/index.html');
  mealsBtn?.addEventListener('click', () => window.location.href = '../meal/meal.html');
  trackerBtn?.addEventListener('click', () => window.location.href = '../tracker/tracker.html');
  exerciseBtn?.addEventListener('click', () => window.location.href = '../exercise/exercise.html');
  profileBtn?.addEventListener('click', () => window.location.href = '../profile/profile.html');
  

  const currentDateDisplay = document.getElementById('currentDate');
  const dateSelector = document.getElementById('date-selector');
  const datepickerTrigger = document.getElementById('datepicker-trigger');
  const prevDayBtn = document.getElementById('prevDay');
  const nextDayBtn = document.getElementById('nextDay');

  const noteDisplay = document.getElementById('note-display');
  const noteEditor = document.getElementById('note-editor');
  const noteContent = document.getElementById('note-content');
  const noteBody = document.getElementById('note-body');
  const editNoteBtn = document.getElementById('edit-note-btn');
  const saveNoteBtn = document.getElementById('save-note-btn');

  const addCardioBtn = document.getElementById('add-cardio');
  const addStrengthBtn = document.getElementById('add-strength');
  const cardioExercisesList = document.getElementById('cardio-exercises');
  const strengthExercisesList = document.getElementById('strength-exercises');
  
  
  const cardioForm = document.getElementById('cardio-form');
  const strengthForm = document.getElementById('strength-form');

  let currentDate = new Date();
  let notes = '';
  const userId = 'your-user-id-here'; // Replace with actual userId
  let allExercises = {
    cardio: [],
    strength: []
  };

  updateDateDisplay();
  loadExercisesForDate();

  prevDayBtn.addEventListener('click', e => {
    e.preventDefault();
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadExercisesForDate();
  });

  nextDayBtn.addEventListener('click', e => {
    e.preventDefault();
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadExercisesForDate();
  });

  datepickerTrigger.addEventListener('click', () => dateSelector.click());

  dateSelector.addEventListener('change', function () {
    currentDate = new Date(this.value);
    updateDateDisplay();
    loadExercisesForDate();
  });

  // Notes
  editNoteBtn.addEventListener('click', function (e) {
    e.preventDefault();
    noteBody.value = notes;
    noteDisplay.classList.add('hidden');
    noteEditor.classList.remove('hidden');
  });

  saveNoteBtn.addEventListener('click', function (e) {
    e.preventDefault();
    notes = noteBody.value;
    noteContent.textContent = notes;
    noteEditor.classList.add('hidden');
    noteDisplay.classList.remove('hidden');
    saveNotes();
  });

  // Toggle forms
  document.getElementById('toggleCardioForm').addEventListener('click', () => {
    cardioForm.classList.toggle('hidden');
  });

  document.getElementById('toggleStrengthForm').addEventListener('click', () => {
    strengthForm.classList.toggle('hidden');
  });

  // Add exercises
  document.getElementById('submitCardio').addEventListener('click', function () {
    const name = document.getElementById('cardio-name').value;
    const minutes = parseInt(document.getElementById('cardio-minutes').value);
    const calories = parseInt(document.getElementById('cardio-calories').value);

    allExercises.cardio.push({ name, durationMinutes: minutes, caloriesBurned: calories });
    renderExercises();
    saveExercises();
  });

  document.getElementById('submitStrength').addEventListener('click', function () {
    const name = document.getElementById('strength-name').value;
    const sets = parseInt(document.getElementById('strength-sets').value);
    const reps = parseInt(document.getElementById('strength-reps').value);
    const weight = parseInt(document.getElementById('strength-weight').value);

    allExercises.strength.push({ name, sets, reps, weight });
    renderExercises();
    saveExercises();
  });

  function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = currentDate.toLocaleDateString('en-US', options);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    dateSelector.value = `${year}-${month}-${day}`;
  }

  function getDateString() {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function loadExercisesForDate() {
    const dateStr = getDateString();
    fetch(`/api/exercise/${userId}?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        allExercises.cardio = data.filter(ex => ex.exerciseType === 'cardio');
        allExercises.strength = data.filter(ex => ex.exerciseType === 'strength');
        renderExercises();
      })
      .catch(err => console.error('Error loading exercises:', err));

    notes = localStorage.getItem(`notes_${dateStr}`) || '';
    noteContent.textContent = notes;
  }

  function renderExercises() {
    cardioExercisesList.innerHTML = '';
    strengthExercisesList.innerHTML = '';

    allExercises.cardio.forEach((ex, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${ex.name}</td>
        <td>${ex.durationMinutes}</td>
        <td>${ex.caloriesBurned}</td>
        <td><button onclick="deleteExercise('cardio', ${i})">Delete</button></td>
      `;
      cardioExercisesList.appendChild(row);
    });

    allExercises.strength.forEach((ex, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${ex.name}</td>
        <td>${ex.sets}</td>
        <td>${ex.reps}</td>
        <td>${ex.weight}</td>
        <td><button onclick="deleteExercise('strength', ${i})">Delete</button></td>
      `;
      strengthExercisesList.appendChild(row);
    });
  }

  window.deleteExercise = function (type, index) {
    allExercises[type].splice(index, 1);
    renderExercises();
    saveExercises();
  };

  function saveExercises() {
    const dateStr = getDateString();

    const dataToSend = [
      ...allExercises.cardio.map(e => ({ ...e, exerciseType: 'cardio', userId, date: dateStr })),
      ...allExercises.strength.map(e => ({ ...e, exerciseType: 'strength', userId, date: dateStr }))
    ];

    fetch('/api/exercise/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    }).catch(err => console.error('Save error:', err));
  }

  function saveNotes() {
    const dateStr = getDateString();
    localStorage.setItem(`notes_${dateStr}`, notes);
  }
   
  
  });

