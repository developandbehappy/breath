document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса
    const timerCount = document.querySelector('.timer-count');
    const phaseText = document.querySelector('.phase-text');
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const progressBar = document.querySelector('.progress');
    const currentCycleDisplay = document.getElementById('current-cycle');
    const totalCyclesDisplay = document.getElementById('total-cycles');


    // Кнопки управления
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const decreaseIntervalBtn = document.getElementById('decrease-interval');
    const increaseIntervalBtn = document.getElementById('increase-interval');
    const togglePhaseSoundsBtn = document.getElementById('toggle-phase-sounds');
    const toggleBackgroundBtn = document.getElementById('toggle-background');

    // Поля ввода
    const intervalLengthInput = document.getElementById('interval-length');
    const preparationTimeInput = document.getElementById('preparation-time');
    const sessionDurationInput = document.getElementById('session-duration');

    // Аудио элементы
    const inhaleSound = document.getElementById('inhale-sound');
    const holdSound = document.getElementById('hold-sound');
    const exhaleSound = document.getElementById('exhale-sound');
    const backgroundSound = document.getElementById('background-sound');
    const completionSound = document.getElementById('completion-sound');

    // Добавляем обработчик события ended для гарантии непрерывного воспроизведения
    backgroundSound.addEventListener('ended', function () {
        if (state.backgroundSoundEnabled && state.isRunning && !state.isPaused) {
            this.play();
        }
    });

    // Состояние приложения
    const state = {
        isRunning: false,
        isPaused: false,
        currentPhase: 'prep', // prep, inhale, hold1, exhale, hold2
        currentTime: 0,
        intervalLength: 10,
        preparationTime: 5,
        sessionDuration: 5, // в минутах
        totalSessionTime: 0,
        remainingSessionTime: 0,
        phaseSoundsEnabled: true,
        backgroundSoundEnabled: false,
        timerId: null,
        phaseTimerId: null,
        totalCycles: 0,
        currentCycle: 0,
        phaseCounter: 0,
        backgroundMusicPosition: 0 // Добавлена новая переменная для хранения позиции
    };

    // Загрузка сохраненных настроек
    loadSettings();

    // Инициализация дисплея
    updateDisplay();

    // Изменение функции updateCycleDurationInfo
    function updateCycleDurationInfo() {
        const cycleDuration = state.intervalLength * 4;

        // Форматирование времени цикла (перевод в минуты:секунды при необходимости)
        let cycleDurationText;
        if (cycleDuration >= 60) {
            const minutes = Math.floor(cycleDuration / 60);
            const seconds = cycleDuration % 60;
            cycleDurationText = `${minutes} мин ${seconds > 0 ? seconds + ' сек' : ''}`;
        } else {
            cycleDurationText = `${cycleDuration} сек`;
        }

        document.getElementById('cycle-duration').textContent = cycleDurationText;
        document.getElementById('interval-value').textContent = state.intervalLength;
        document.getElementById('interval-value-2').textContent = state.intervalLength;
        document.getElementById('interval-value-3').textContent = state.intervalLength;
        document.getElementById('interval-value-4').textContent = state.intervalLength;
    }

    updateCycleDurationInfo();

    // Обработчики событий
    startBtn.addEventListener('click', startBreathing);
    pauseBtn.addEventListener('click', togglePause);
    stopBtn.addEventListener('click', stopBreathing);
    decreaseIntervalBtn.addEventListener('click', () => changeInterval(-1));
    increaseIntervalBtn.addEventListener('click', () => changeInterval(1));
    togglePhaseSoundsBtn.addEventListener('click', togglePhaseSounds);
    toggleBackgroundBtn.addEventListener('click', toggleBackgroundSound);

    intervalLengthInput.addEventListener('change', () => {
        state.intervalLength = parseInt(intervalLengthInput.value);
        saveSettings();
        updateCycleDurationInfo();
    });

    preparationTimeInput.addEventListener('change', () => {
        state.preparationTime = parseInt(preparationTimeInput.value);
        saveSettings();
    });

    sessionDurationInput.addEventListener('change', () => {
        state.sessionDuration = parseInt(sessionDurationInput.value);
        saveSettings();
        updateRemainingTimeDisplay();
    });

    // Обработка клавиш клавиатуры
    document.addEventListener('keydown', (e) => {
        // Определяем активную вкладку
        const activeTab = document.querySelector('.tab-content.active').id;

        if (activeTab === 'practice') {
            // Для квадратичного дыхания
            if (e.key === 'ArrowLeft') {
                changeInterval(-1);
            } else if (e.key === 'ArrowRight') {
                changeInterval(1);
            }
        }
    });

    // Функции
    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('breathingSettings'));
        if (savedSettings) {
            state.intervalLength = savedSettings.intervalLength ?? 10;
            state.preparationTime = savedSettings.preparationTime ?? 5;
            state.sessionDuration = savedSettings.sessionDuration ?? 5;
            state.phaseSoundsEnabled = savedSettings.phaseSoundsEnabled ?? true;
            state.backgroundSoundEnabled = savedSettings.backgroundSoundEnabled ?? false;
            state.backgroundMusicPosition = savedSettings.backgroundMusicPosition ?? 0;

            // Обновляем текущее время для отображения
            state.currentTime = state.preparationTime;

            // Обновление полей ввода
            intervalLengthInput.value = state.intervalLength;
            preparationTimeInput.value = state.preparationTime;
            sessionDurationInput.value = state.sessionDuration;

            // Обновление кнопок звука
            togglePhaseSoundsBtn.classList.toggle('active', state.phaseSoundsEnabled);
            toggleBackgroundBtn.classList.toggle('active', state.backgroundSoundEnabled);


            // Восстановление позиции фоновой музыки
            backgroundSound.currentTime = state.backgroundMusicPosition;
        }

        // Обновляем отображение времени сессии
        updateRemainingTimeDisplay();
    }

    function saveSettings() {
        const settings = {
            intervalLength: state.intervalLength,
            preparationTime: state.preparationTime,
            sessionDuration: state.sessionDuration,
            phaseSoundsEnabled: state.phaseSoundsEnabled,
            backgroundSoundEnabled: state.backgroundSoundEnabled,
            backgroundMusicPosition: state.backgroundMusicPosition
        };
        localStorage.setItem('breathingSettings', JSON.stringify(settings));
    }

    function calculateTotalCycles() {
        // Один цикл = все 4 фазы (вдох, задержка, выдох, задержка)
        const cycleDuration = state.intervalLength * 4; // в секундах

        // Если мы уже в сессии, используем оставшееся время
        if (state.isRunning) {
            const sessionTimeWithoutPrep = state.remainingSessionTime -
                (state.currentPhase === 'prep' ? state.currentTime : 0);
            return Math.floor(sessionTimeWithoutPrep / cycleDuration);
        }
        // Иначе расчет для новой сессии
        else {
            const totalTime = state.sessionDuration * 60; // в секундах
            const totalSessionTimeWithoutPrep = totalTime - state.preparationTime;
            return Math.floor(totalSessionTimeWithoutPrep / cycleDuration);
        }
    }

    function updateCyclesDisplay() {
        currentCycleDisplay.textContent = state.currentCycle;
        totalCyclesDisplay.textContent = state.totalCycles;
    }

    function changeInterval(delta) {
        state.intervalLength = Math.max(2, Math.min(40, state.intervalLength + delta));
        intervalLengthInput.value = state.intervalLength;
        saveSettings();
        if (state.isRunning) {
            // Пересчитываем totalSessionTime на основе оставшегося времени
            state.totalCycles = calculateTotalCycles();
            updateCyclesDisplay();
        }

        updateDisplay();
        updateCycleDurationInfo();
    }

    function togglePhaseSounds() {
        state.phaseSoundsEnabled = !state.phaseSoundsEnabled;
        togglePhaseSoundsBtn.classList.toggle('active');
        saveSettings();
    }

    function toggleBackgroundSound() {
        state.backgroundSoundEnabled = !state.backgroundSoundEnabled;
        toggleBackgroundBtn.classList.toggle('active');

        if (state.backgroundSoundEnabled && state.isRunning) {
            backgroundSound.volume = BACKGROUND_MUSIC_VOLUME;
            backgroundSound.play();
        } else {
            backgroundSound.pause();
            backgroundSound.currentTime = 0;
        }

        saveSettings();
    }

    function startBreathing() {
        if (state.isRunning && !state.isPaused) return;

        if (!state.isPaused) {
            // Новая сессия
            state.currentPhase = 'prep';
            state.currentTime = state.preparationTime;
            state.totalSessionTime = state.sessionDuration * 60; // в секундах
            state.remainingSessionTime = state.totalSessionTime;
            state.totalCycles = calculateTotalCycles();
            state.currentCycle = 0;
            state.phaseCounter = 0;

            updateCyclesDisplay();
        }

        state.isRunning = true;
        state.isPaused = false;

        // Обновление кнопок
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;

        // Запуск фоновой музыки если нужно
        if (state.backgroundSoundEnabled) {
            backgroundSound.currentTime = state.backgroundMusicPosition;
            backgroundSound.volume = BACKGROUND_MUSIC_VOLUME;
            backgroundSound.play();
        }

        // Запуск таймеров
        if (!state.timerId) {
            state.timerId = setInterval(updateSessionTime, 1000);
        }

        if (!state.phaseTimerId) {
            updatePhase();
            state.phaseTimerId = setInterval(updatePhase, 1000);
        }
    }

    function togglePause() {
        if (!state.isRunning) return;

        state.isPaused = !state.isPaused;

        if (state.isPaused) {
            pauseBtn.textContent = 'Продолжить';
            clearInterval(state.phaseTimerId);
            state.phaseTimerId = null;
            clearInterval(state.timerId);
            state.timerId = null;

            if (state.backgroundSoundEnabled) {
                backgroundSound.pause();
            }
        } else {
            pauseBtn.textContent = 'Пауза';
            state.phaseTimerId = setInterval(updatePhase, 1000);
            state.timerId = setInterval(updateSessionTime, 1000);

            if (state.backgroundSoundEnabled) {
                backgroundSound.currentTime = state.backgroundMusicPosition;
                backgroundSound.volume = BACKGROUND_MUSIC_VOLUME;
                backgroundSound.play();
            }
        }
    }

    function stopBreathing() {
        if (state.backgroundSoundEnabled) {
            // Сохраняем текущую позицию фоновой музыки
            state.backgroundMusicPosition = backgroundSound.currentTime;
            saveSettings(); // Сохраняем позицию в localStorage
        }
        state.isRunning = false;
        state.isPaused = false;

        // Остановка таймеров
        clearInterval(state.phaseTimerId);
        clearInterval(state.timerId);
        state.phaseTimerId = null;
        state.timerId = null;

        // Остановка звуков
        inhaleSound.pause();
        inhaleSound.currentTime = 0;
        holdSound.pause();
        holdSound.currentTime = 0;
        exhaleSound.pause();
        exhaleSound.currentTime = 0;
        backgroundSound.pause();
        // Не сбрасываем позицию backgroundSound.currentTime = 0;

        // Сброс состояния
        state.currentPhase = 'prep';
        state.currentTime = state.preparationTime;
        state.currentCycle = 0;
        state.totalCycles = 0;

        // Убедимся, что все элементы интерфейса обновлены
        updateCyclesDisplay();
        timerCount.textContent = state.preparationTime;
        phaseText.textContent = 'Подготовьтесь';

        // Обновление кнопок
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = 'Пауза';
        stopBtn.disabled = true;

        // Обновление интерфейса
        updateDisplay();
        updateRemainingTimeDisplay();
        progressBar.style.width = '0%';
    }

    function updatePhase() {
        // Уменьшаем счетчик текущей фазы
        state.currentTime--;

        // Обновляем индикатор каждую секунду для плавного движения

        if (state.currentTime < 0) {
            // Переход к следующей фазе
            switch (state.currentPhase) {
                case 'prep':
                    state.currentPhase = 'inhale';
                    playPhaseSound('inhale');
                    state.phaseCounter = 1; // Начинаем первую фазу цикла
                    break;
                case 'inhale':
                    state.currentPhase = 'hold1';
                    playPhaseSound('hold');
                    state.phaseCounter = 2;
                    break;
                case 'hold1':
                    state.currentPhase = 'exhale';
                    playPhaseSound('exhale');
                    state.phaseCounter = 3;
                    break;
                case 'exhale':
                    state.currentPhase = 'hold2';
                    playPhaseSound('hold');
                    state.phaseCounter = 4;
                    state.currentCycle++;
                    updateCyclesDisplay();
                    break;
                case 'hold2':
                    state.currentPhase = 'inhale';
                    playPhaseSound('inhale');
                    state.phaseCounter = 1; // Начинаем новый цикл
                    break;
            }

            // Установка времени для новой фазы
            state.currentTime = state.currentPhase === 'prep' ?
                state.preparationTime : state.intervalLength;
        }

        updateDisplay();
    }

    function updateSessionTime() {
        state.remainingSessionTime--;
        updateRemainingTimeDisplay();

        // Обновляем прогресс-бар
        const progress = 100 - (state.remainingSessionTime / state.totalSessionTime * 100);
        progressBar.style.width = `${progress}%`;

        if (state.remainingSessionTime <= 0) {
            // Воспроизводим звук завершения при естественном завершении сессии
            if (state.phaseSoundsEnabled) {
                completionSound.play();
            }
            stopBreathing();
        }
    }

    function playPhaseSound(phase) {
        if (!state.phaseSoundsEnabled) return;

        switch (phase) {
            case 'inhale':
                inhaleSound.currentTime = 0;
                inhaleSound.play();
                break;
            case 'hold':
                holdSound.currentTime = 0;
                holdSound.play();
                break;
            case 'exhale':
                exhaleSound.currentTime = 0;
                exhaleSound.play();
                break;
        }
    }

    function updateDisplay() {
        timerCount.textContent = state.currentTime;

        // Обновление текста фазы и анимации
        switch (state.currentPhase) {
            case 'prep':
                phaseText.textContent = 'Подготовьтесь';
                break;
            case 'inhale':
                phaseText.textContent = 'Вдох';
                document.documentElement.style.setProperty('--duration', `${state.intervalLength}s`);
                break;
            case 'hold1':
                phaseText.textContent = 'Задержка после вдоха';
                break;
            case 'exhale':
                phaseText.textContent = 'Выдох';
                document.documentElement.style.setProperty('--duration', `${state.intervalLength}s`);
                break;
            case 'hold2':
                phaseText.textContent = 'Задержка после выдоха';
                break;
        }
        updateCyclesDisplay();
    }


    function updateRemainingTimeDisplay() {
        if (!state.isRunning) {
            // Показываем общее время сессии
            const minutes = String(state.sessionDuration).padStart(2, '0');
            const seconds = '00';
            minutesDisplay.textContent = minutes;
            secondsDisplay.textContent = seconds;
            return;
        }

        // Показываем оставшееся время
        const minutes = Math.floor(state.remainingSessionTime / 60);
        const seconds = state.remainingSessionTime % 60;
        minutesDisplay.textContent = String(minutes).padStart(2, '0');
        secondsDisplay.textContent = String(seconds).padStart(2, '0');
    }

    updateCyclesDisplay();
});