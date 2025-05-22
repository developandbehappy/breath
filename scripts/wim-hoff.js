document.addEventListener('DOMContentLoaded', () => {
    // Элементы интерфейса для метода Вима Хофа

    const whTimer = document.getElementById('wh-timer');
    const whPhase = document.getElementById('wh-phase');
    const whMinutesDisplay = document.getElementById('wh-minutes');
    const whSecondsDisplay = document.getElementById('wh-seconds');
    const whProgressBar = document.getElementById('wh-progress');
    const whCurrentBreathDisplay = document.getElementById('wh-current-breath');
    const whTotalBreathsDisplay = document.getElementById('wh-total-breaths');
    const whCurrentRoundDisplay = document.getElementById('wh-current-round');
    const whTotalRoundsDisplay = document.getElementById('wh-total-rounds');

    // Кнопки управления
    const whStartBtn = document.getElementById('wh-start-btn');
    const whPauseBtn = document.getElementById('wh-pause-btn');
    const whStopBtn = document.getElementById('wh-stop-btn');
    const decreaseInhalationBtn = document.getElementById('decrease-inhalation');
    const increaseInhalationBtn = document.getElementById('increase-inhalation');
    const decreaseExhalationBtn = document.getElementById('decrease-exhalation');
    const increaseExhalationBtn = document.getElementById('increase-exhalation');
    const decreaseBreathsBtn = document.getElementById('decrease-breaths');
    const increaseBreathsBtn = document.getElementById('increase-breaths');
    const decreaseRoundsBtn = document.getElementById('decrease-rounds');
    const increaseRoundsBtn = document.getElementById('increase-rounds');
    const whTogglePhaseSoundsBtn = document.getElementById('wh-toggle-phase-sounds');
    const whToggleBackgroundBtn = document.getElementById('wh-toggle-background');

    const decreaseHoldTimeBtn = document.getElementById('decrease-hold-time');
    const increaseHoldTimeBtn = document.getElementById('increase-hold-time');
    const decreaseRecoveryInhaleBtn = document.getElementById('decrease-recovery-inhale');
    const increaseRecoveryInhaleBtn = document.getElementById('increase-recovery-inhale');

    // Поля ввода
    const inhalationLengthInput = document.getElementById('wh-inhalation-length');
    const exhalationLengthInput = document.getElementById('wh-exhalation-length');
    const breathsCountInput = document.getElementById('wh-breaths-count');
    const roundsInput = document.getElementById('wh-rounds');
    const whPreparationTimeInput = document.getElementById('wh-preparation-time');
    const holdTimeInput = document.getElementById('wh-hold-time');
    const recoveryInhaleTimeInput = document.getElementById('wh-recovery-inhale-time');

    // Аудио элементы (используем существующие и новые)
    const inhaleSound = document.getElementById('inhale-sound');
    const exhaleSound = document.getElementById('exhale-sound');
    const holdLongSound = document.getElementById('hold-long-sound');
    const recoveryBreathSound = document.getElementById('recovery-breath-sound');
    const backgroundSound = document.getElementById('background-sound');
    const completionSound = document.getElementById('completion-sound');
    const lastBreathInSound = document.getElementById('last-breath-in-sound');
    const lastBreathOutSound = document.getElementById('last-breath-out-sound');

    // Добавляем обработчик события ended (если ещё не добавлен)
    if (!backgroundSound._hasEndedHandler) {
        backgroundSound.addEventListener('ended', function () {
            if (whState.backgroundSoundEnabled && whState.isRunning && !whState.isPaused) {
                this.play();
            }
        });
        backgroundSound._hasEndedHandler = true;
    }

    // Состояние приложения для метода Вима Хофа
    const whState = {
        isRunning: false,
        isPaused: false,
        currentPhase: 'prep', // prep, inhale, exhale, hold, recovery
        currentTime: 0,
        inhalationLength: 1.5,
        exhalationLength: 2,
        breathsCount: 30,
        rounds: 3,
        preparationTime: 10,
        currentBreath: 0,
        currentRound: 0,
        phaseSoundsEnabled: true,
        backgroundSoundEnabled: false,
        timerId: null,
        sessionStartTime: 0,
        sessionDuration: 0,
        holdTime: 0, // 0 означает без ограничения (до нажатия)
        recoveryInhaleTime: 18, // время вдоха после задержки
        backgroundMusicPosition: 0
    };

    // Загрузка сохраненных настроек
    loadWhSettings();

    // Функция загрузки настроек для метода Вима Хофа
    function loadWhSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('wimHofSettings'));
        if (savedSettings) {
            whState.inhalationLength = savedSettings.inhalationLength ?? 1.5;
            whState.exhalationLength = savedSettings.exhalationLength ?? 2;
            whState.breathsCount = savedSettings.breathsCount ?? 30;
            whState.rounds = savedSettings.rounds ?? 3;
            whState.preparationTime = savedSettings.preparationTime ?? 10;
            whState.phaseSoundsEnabled = savedSettings.phaseSoundsEnabled ?? true;
            whState.backgroundSoundEnabled = savedSettings.backgroundSoundEnabled ?? false;
            whState.holdTime = savedSettings.holdTime ?? 0;
            whState.recoveryInhaleTime = savedSettings.recoveryInhaleTime ?? 15;
            whState.backgroundMusicPosition = savedSettings.backgroundMusicPosition ?? 0;

            // Обновляем текущее время для отображения
            whState.currentTime = whState.preparationTime;

            // Обновление полей ввода
            inhalationLengthInput.value = whState.inhalationLength;
            exhalationLengthInput.value = whState.exhalationLength;
            breathsCountInput.value = whState.breathsCount;
            roundsInput.value = whState.rounds;
            whPreparationTimeInput.value = whState.preparationTime;
            holdTimeInput.value = whState.holdTime;
            recoveryInhaleTimeInput.value = whState.recoveryInhaleTime;

            // Обновление кнопок звука
            whTogglePhaseSoundsBtn.classList.toggle('active', whState.phaseSoundsEnabled);
            whToggleBackgroundBtn.classList.toggle('active', whState.backgroundSoundEnabled);
        }

        updateWhDisplay();
    }

    // Функция сохранения настроек для метода Вима Хофа
    function saveWhSettings() {
        const settings = {
            inhalationLength: whState.inhalationLength,
            exhalationLength: whState.exhalationLength,
            breathsCount: whState.breathsCount,
            rounds: whState.rounds,
            preparationTime: whState.preparationTime,
            phaseSoundsEnabled: whState.phaseSoundsEnabled,
            backgroundSoundEnabled: whState.backgroundSoundEnabled,
            holdTime: whState.holdTime,
            recoveryInhaleTime: whState.recoveryInhaleTime,
            backgroundMusicPosition: whState.backgroundMusicPosition
        };
        localStorage.setItem('wimHofSettings', JSON.stringify(settings));
    }

    // Обработчики событий для метода Вима Хофа
    whStartBtn.addEventListener('click', startWimHof);
    whPauseBtn.addEventListener('click', toggleWimHofPause);
    whStopBtn.addEventListener('click', stopWimHof);

    decreaseInhalationBtn.addEventListener('click', () => changeInhalation(-0.5));
    increaseInhalationBtn.addEventListener('click', () => changeInhalation(0.5));

    decreaseExhalationBtn.addEventListener('click', () => changeExhalation(-0.5));
    increaseExhalationBtn.addEventListener('click', () => changeExhalation(0.5));

    decreaseBreathsBtn.addEventListener('click', () => changeBreaths(-5));
    increaseBreathsBtn.addEventListener('click', () => changeBreaths(5));

    decreaseRoundsBtn.addEventListener('click', () => changeRounds(-1));
    increaseRoundsBtn.addEventListener('click', () => changeRounds(1));

    whTogglePhaseSoundsBtn.addEventListener('click', toggleWimHofPhaseSounds);
    whToggleBackgroundBtn.addEventListener('click', toggleWimHofBackgroundSound);

    decreaseHoldTimeBtn.addEventListener('click', () => changeHoldTime(-1));
    increaseHoldTimeBtn.addEventListener('click', () => changeHoldTime(1));
    decreaseRecoveryInhaleBtn.addEventListener('click', () => changeRecoveryInhaleTime(-1));
    increaseRecoveryInhaleBtn.addEventListener('click', () => changeRecoveryInhaleTime(1));

    inhalationLengthInput.addEventListener('change', () => {
        whState.inhalationLength = parseFloat(inhalationLengthInput.value);
        saveWhSettings();
        updateWimHofCycleSummary();
    });

    exhalationLengthInput.addEventListener('change', () => {
        whState.exhalationLength = parseFloat(exhalationLengthInput.value);
        saveWhSettings();
        updateWimHofCycleSummary();
    });

    breathsCountInput.addEventListener('change', () => {
        whState.breathsCount = parseInt(breathsCountInput.value);
        saveWhSettings();
        updateWhTotalBreaths();
        updateWimHofCycleSummary();
    });

    roundsInput.addEventListener('change', () => {
        whState.rounds = parseInt(roundsInput.value);
        saveWhSettings();
        updateWhTotalRounds();
        updateWimHofCycleSummary();
    });

    whPreparationTimeInput.addEventListener('change', () => {
        whState.preparationTime = parseInt(whPreparationTimeInput.value);
        saveWhSettings();
    });

    holdTimeInput.addEventListener('change', () => {
        whState.holdTime = parseInt(holdTimeInput.value);
        saveWhSettings();
        updateWimHofCycleSummary();
    });

    recoveryInhaleTimeInput.addEventListener('change', () => {
        whState.recoveryInhaleTime = parseInt(recoveryInhaleTimeInput.value);
        saveWhSettings();
        updateWimHofCycleSummary();
    });


    document.addEventListener('keydown', (e) => {
        // Определяем активную вкладку
        const activeTab = document.querySelector('.tab-content.active').id;

        if (activeTab === 'wim-hof') {
            // Для метода Вима Хофа - изменяем одновременно вдох и выдох
            if (e.key === 'ArrowLeft') {
                // Уменьшаем оба параметра
                changeInhalation(-1);
                changeExhalation(-1);
            } else if (e.key === 'ArrowRight') {
                // Увеличиваем оба параметра
                changeInhalation(1);
                changeExhalation(1);
            }
        }
    });
    // Функции для управления методом Вима Хофа
    function startWimHof() {
        if (whState.isRunning && !whState.isPaused) return;

        if (!whState.isPaused) {
            // Новая сессия
            whState.currentPhase = 'prep';
            whState.currentTime = whState.preparationTime;
            whState.currentBreath = 0;
            whState.currentRound = 1;
            whState.sessionStartTime = Date.now();

            updateWhTotalBreaths();
            updateWhTotalRounds();
        }

        whState.isRunning = true;
        whState.isPaused = false;

        // Обновление кнопок
        whStartBtn.disabled = true;
        whPauseBtn.disabled = false;
        whStopBtn.disabled = false;

        // Запуск фоновой музыки если нужно
        if (whState.backgroundSoundEnabled) {
            // Используем сохраненную позицию
            backgroundSound.currentTime = whState.backgroundMusicPosition;
            backgroundSound.volume = BACKGROUND_MUSIC_VOLUME;
            backgroundSound.play();
        }

        // Запуск таймера
        if (!whState.timerId) {
            updateWhPhase();
            whState.timerId = setInterval(updateWhPhase, 100); // Используем 100мс для более точного отсчета дробных секунд
        }
    }

    function toggleWimHofPause() {
        if (!whState.isRunning) return;

        whState.isPaused = !whState.isPaused;

        if (whState.isPaused) {
            whPauseBtn.textContent = 'Продолжить';
            clearInterval(whState.timerId);
            whState.timerId = null;

            if (whState.backgroundSoundEnabled) {
                // Сохраняем текущую позицию музыки и приостанавливаем
                whState.backgroundMusicPosition = backgroundSound.currentTime;
                backgroundSound.pause();
                saveWhSettings(); // Сохраняем позицию в localStorage
            }
        } else {
            whPauseBtn.textContent = 'Пауза';
            whState.timerId = setInterval(updateWhPhase, 100);

            if (whState.backgroundSoundEnabled) {
                // Продолжаем с сохраненной позиции
                backgroundSound.currentTime = whState.backgroundMusicPosition;
                backgroundSound.volume = BACKGROUND_MUSIC_VOLUME;
                backgroundSound.play();
            }
        }
    }


    function updateWhPhase() {
        // Уменьшаем счетчик текущей фазы
        whState.currentTime -= 0.1;

        // Обновление времени сессии
        updateWhSessionTime();

        // Обновляем прогресс-бар в зависимости от текущей фазы
        updateWhProgressBar();

        // Играем дополнительный звук за 6 секунд до конца восстановительной фазы
        if (whState.currentPhase === 'recovery' &&
            Math.abs(whState.currentTime - 6) < 0.05 &&
            whState.phaseSoundsEnabled) {
            playWhPhaseSound('exhale'); // Воспроизведение звука выдоха
        }

        // Добавляем оповещение перед последним вдохом в раунде
        if (whState.currentPhase === 'exhale' &&
            whState.currentBreath === whState.breathsCount - 1 &&
            Math.abs(whState.currentTime - 1) < 0.05 &&
            whState.phaseSoundsEnabled) {
            playWhPhaseSound('last_breath_in');
        }

        if (whState.currentPhase === 'inhale' &&
            whState.currentBreath === whState.breathsCount - 1 &&
            Math.abs(whState.currentTime - 1) < 0.05 &&
            whState.phaseSoundsEnabled) {
            playWhPhaseSound('last_breath_out');
        }

        if (whState.currentTime <= 0) {
            // Переходим к следующей фазе
            moveToNextWhPhase();
        }

        updateWhDisplay();
    }

    function updateWhProgressBar() {
        if (whState.currentPhase === 'inhale' || whState.currentPhase === 'exhale') {
            const totalBreathCycleTime = whState.inhalationLength + whState.exhalationLength;
            const currentPhaseMaxTime = whState.currentPhase === 'inhale' ?
                whState.inhalationLength : whState.exhalationLength;
            const currentPhaseElapsed = currentPhaseMaxTime - whState.currentTime;
            const progress = Math.min(100, Math.max(0, (currentPhaseElapsed / currentPhaseMaxTime) * 100));
            whProgressBar.style.width = `${progress}%`;
        } else if (whState.currentPhase === 'prep') {
            const progress = Math.min(100, Math.max(0,
                ((whState.preparationTime - whState.currentTime) / whState.preparationTime) * 100));
            whProgressBar.style.width = `${progress}%`;
        } else if (whState.currentPhase === 'recovery') {
            const progress = Math.min(100, Math.max(0, ((whState.recoveryInhaleTime - whState.currentTime) / whState.recoveryInhaleTime) * 100));
            whProgressBar.style.width = `${progress}%`;
        } else if (whState.currentPhase === 'hold') {
            if (whState.holdTime > 0) {
                // Если задано конкретное время задержки, показываем прогресс
                const elapsedTime = whState.holdTime - whState.currentTime;
                const progress = Math.min(100, Math.max(0, (elapsedTime / whState.holdTime) * 100));
                whProgressBar.style.width = `${progress}%`;
            } else {
                // Если задержка без ограничения (до нажатия),
                // оставляем пустой прогресс-бар или можно добавить пульсирующую анимацию
                whProgressBar.style.width = '0%';
            }
        }
    }

    function moveToNextWhPhase() {
        switch (whState.currentPhase) {
            case 'prep':
                // Переход из фазы подготовки к первому вдоху
                whState.currentPhase = 'inhale';
                whState.currentTime = whState.inhalationLength;
                playWhPhaseSound('inhale'); // Воспроизведение звука вдоха
                break;

            case 'inhale':
                // Переход от вдоха к выдоху
                whState.currentPhase = 'exhale';
                whState.currentTime = whState.exhalationLength;
                playWhPhaseSound('exhale'); // Воспроизведение звука выдоха
                whState.currentBreath++; // Увеличиваем счетчик дыханий
                updateWhBreathDisplay(); // Обновляем отображение счетчика вдохов
                break;

            case 'exhale':
                // После выдоха проверяем, закончился ли цикл дыханий
                if (whState.currentBreath >= whState.breathsCount) {
                    // Если достигли нужного количества дыханий, переходим к задержке дыхания
                    whState.currentPhase = 'hold';
                    whState.currentTime = whState.holdTime === 0 ? Infinity : whState.holdTime;
                    playWhPhaseSound('hold-long'); // Звук начала задержки дыхания
                } else {
                    // Иначе переходим к следующему вдоху
                    whState.currentPhase = 'inhale';
                    whState.currentTime = whState.inhalationLength;
                    playWhPhaseSound('inhale');
                }
                break;

            case 'hold':
                // После задержки дыхания переходим к восстановительному дыханию
                whState.currentPhase = 'recovery';
                whState.currentTime = whState.recoveryInhaleTime;
                playWhPhaseSound('inhale'); // Воспроизведение звука выдоха
                break;

            case 'recovery':
                // После восстановления проверяем, не последний ли это был раунд
                if (whState.currentRound >= whState.rounds) {
                    // Если прошли все раунды, завершаем сессию
                    if (whState.phaseSoundsEnabled) {
                        completionSound.play(); // Звук завершения всей сессии
                    }
                    stopWimHof(); // Останавливаем таймер и сбрасываем состояние
                    return;
                }

                // Начинаем следующий раунд
                whState.currentRound++;
                updateWhRoundDisplay(); // Обновляем отображение текущего раунда

                // Сбрасываем счетчик дыханий и начинаем с первого вдоха
                whState.currentPhase = 'inhale';
                whState.currentTime = whState.inhalationLength;
                whState.currentBreath = 0;
                playWhPhaseSound('inhale');
                updateWhBreathDisplay();
                break;
        }

        // Сбрасываем прогресс-бар при переходе к новой фазе
        whProgressBar.style.width = '0%';
    }

    function stopWimHof() {
        if (whState.backgroundSoundEnabled) {
            // Сохраняем текущую позицию фоновой музыки
            whState.backgroundMusicPosition = backgroundSound.currentTime;
            saveWhSettings(); // Сохраняем позицию в localStorage
        }
        whState.isRunning = false;
        whState.isPaused = false;

        // Остановка таймера
        clearInterval(whState.timerId);
        whState.timerId = null;

        // Остановка звуков
        inhaleSound.pause();
        inhaleSound.currentTime = 0;
        exhaleSound.pause();
        exhaleSound.currentTime = 0;
        holdLongSound.pause();
        holdLongSound.currentTime = 0;
        recoveryBreathSound.pause();
        recoveryBreathSound.currentTime = 0;
        backgroundSound.pause();
        // Не сбрасываем позицию backgroundSound.currentTime = 0;

        // Сброс состояния
        whState.currentPhase = 'prep';
        whState.currentTime = whState.preparationTime;
        whState.currentBreath = 0;
        whState.currentRound = 0;

        // Обновление кнопок
        whStartBtn.disabled = false;
        whPauseBtn.disabled = true;
        whPauseBtn.textContent = 'Пауза';
        whStopBtn.disabled = true;

        // Обновление всех элементов интерфейса
        whTimer.textContent = whState.preparationTime;
        whPhase.textContent = 'Подготовьтесь';
        whCurrentBreathDisplay.textContent = '0';
        whCurrentRoundDisplay.textContent = '0';
        whProgressBar.style.width = '0%';

        // Удаление обработчика клика задержки дыхания
        document.querySelector('.breathing-box').onclick = null;

        // Обновление времени сессии
        whMinutesDisplay.textContent = '00';
        whSecondsDisplay.textContent = '00';
    }

    function playWhPhaseSound(phase) {
        if (!whState.phaseSoundsEnabled) return;

        switch (phase) {
            case 'inhale':
                inhaleSound.currentTime = 0;
                inhaleSound.play();
                break;
            case 'exhale':
                exhaleSound.currentTime = 0;
                exhaleSound.play();
                break;
            case 'hold-long':
                holdLongSound.currentTime = 0;
                holdLongSound.play();
                break;
            case 'last_breath_in':
                lastBreathInSound.currentTime = 0;
                lastBreathInSound.play();
                break;
            case 'last_breath_out':
                lastBreathOutSound.currentTime = 0;
                lastBreathOutSound.play();
                break;
            case 'recovery':
                recoveryBreathSound.currentTime = 0;
                recoveryBreathSound.play();
                break;
        }
    }

    function updateWhDisplay() {
        let displayTime;
        if (whState.currentPhase === 'hold' && whState.currentTime === Infinity) {
            displayTime = '∞';
        } else if (whState.currentTime === Infinity) {
            displayTime = '∞';
        } else {
            displayTime = Math.max(0, Math.ceil(whState.currentTime)).toString();
        }
        whTimer.textContent = displayTime;

        switch (whState.currentPhase) {
            case 'prep':
                whPhase.textContent = 'Подготовьтесь';
                break;
            case 'inhale':
                whPhase.textContent = 'Вдох';
                break;
            case 'exhale':
                whPhase.textContent = 'Выдох';
                break;
            case 'hold':
                if (whState.holdTime === 0) {
                    whPhase.textContent = 'Задержка дыхания (нажмите, когда готовы)';
                    document.querySelector('.breathing-box').onclick = finishHoldPhase;
                } else {
                    whPhase.textContent = 'Задержка дыхания';
                    document.querySelector('.breathing-box').onclick = finishHoldPhase;
                }
                break;
            case 'recovery':
                whPhase.textContent = 'Восстановительное дыхание';
                document.querySelector('.breathing-box').onclick = null;
                break;
        }
    }

    function finishHoldPhase() {
        if (whState.isRunning && whState.currentPhase === 'hold') {
            whState.currentPhase = 'recovery';
            whState.currentTime = whState.recoveryInhaleTime;
            playWhPhaseSound('recovery');
            document.querySelector('.breathing-box').onclick = null;
        }
    }

    function updateWhSessionTime() {
        if (!whState.isRunning) {
            whMinutesDisplay.textContent = '00';
            whSecondsDisplay.textContent = '00';
            return;
        }

        const elapsedTime = Math.floor((Date.now() - whState.sessionStartTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        whMinutesDisplay.textContent = String(minutes).padStart(2, '0');
        whSecondsDisplay.textContent = String(seconds).padStart(2, '0');
    }

    function updateWhBreathDisplay() {
        whCurrentBreathDisplay.textContent = whState.currentBreath;
    }

    function updateWhRoundDisplay() {
        whCurrentRoundDisplay.textContent = whState.currentRound;
    }

    function updateWhTotalBreaths() {
        whTotalBreathsDisplay.textContent = whState.breathsCount;
    }

    function updateWhTotalRounds() {
        whTotalRoundsDisplay.textContent = whState.rounds;
    }

    function changeInhalation(delta) {
        whState.inhalationLength = Math.max(0.5, Math.min(100, whState.inhalationLength + delta));
        inhalationLengthInput.value = whState.inhalationLength.toFixed(1);
        saveWhSettings();
        updateWimHofCycleSummary();
    }

    function changeExhalation(delta) {
        whState.exhalationLength = Math.max(0.5, Math.min(100, whState.exhalationLength + delta));
        exhalationLengthInput.value = whState.exhalationLength.toFixed(1);
        saveWhSettings();
        updateWimHofCycleSummary();
    }

    function changeBreaths(delta) {
        whState.breathsCount = Math.max(10, Math.min(60, whState.breathsCount + delta));
        breathsCountInput.value = whState.breathsCount;
        saveWhSettings();
        updateWhTotalBreaths();
        updateWimHofCycleSummary();
    }

    function changeRounds(delta) {
        whState.rounds = Math.max(1, Math.min(10, whState.rounds + delta));
        roundsInput.value = whState.rounds;
        saveWhSettings();
        updateWhTotalRounds();
        updateWimHofCycleSummary();
    }

    function changeHoldTime(delta) {
        whState.holdTime = Math.max(0, whState.holdTime + delta);
        holdTimeInput.value = whState.holdTime;
        saveWhSettings();
        updateWimHofCycleSummary();
    }

    function changeRecoveryInhaleTime(delta) {
        whState.recoveryInhaleTime = Math.max(1, Math.min(30, whState.recoveryInhaleTime + delta));
        recoveryInhaleTimeInput.value = whState.recoveryInhaleTime;
        saveWhSettings();
        updateWimHofCycleSummary();
    }

    function toggleWimHofPhaseSounds() {
        whState.phaseSoundsEnabled = !whState.phaseSoundsEnabled;
        whTogglePhaseSoundsBtn.classList.toggle('active');
        saveWhSettings();
    }

    function toggleWimHofBackgroundSound() {
        whState.backgroundSoundEnabled = !whState.backgroundSoundEnabled;
        whToggleBackgroundBtn.classList.toggle('active');

        if (whState.backgroundSoundEnabled && whState.isRunning) {
            backgroundSound.volume = BACKGROUND_MUSIC_VOLUME;
            backgroundSound.play();
        } else {
            backgroundSound.pause();
            backgroundSound.currentTime = 0;
        }

        saveWhSettings();
    }

    function updateWimHofCycleSummary() {
        const breathCycleTime = whState.inhalationLength + whState.exhalationLength;
        const breathingPhaseTime = breathCycleTime * whState.breathsCount;
        const holdPhaseTime = whState.holdTime === 0 ? 90 : whState.holdTime;
        const recoveryPhaseTime = whState.recoveryInhaleTime;
        const totalRoundTime = breathingPhaseTime + holdPhaseTime + recoveryPhaseTime;

        // Форматирование времени цикла
        let roundTimeText;
        if (totalRoundTime >= 60) {
            const minutes = Math.floor(totalRoundTime / 60);
            const seconds = Math.floor(totalRoundTime % 60);
            roundTimeText = `${minutes} мин ${seconds > 0 ? seconds + ' сек' : ''}`;
        } else {
            roundTimeText = `${Math.floor(totalRoundTime)} сек`;
        }

        // Общее время сессии
        const totalSessionTime = totalRoundTime * whState.rounds;
        const sessionMinutes = Math.floor(totalSessionTime / 60);
        const sessionSeconds = Math.floor(totalSessionTime % 60);
        const sessionTimeText = `${sessionMinutes} мин ${sessionSeconds > 0 ? sessionSeconds + ' сек' : ''}`;

        // Обновляем значения в новом блоке
        document.getElementById('wh-cycle-duration').textContent = roundTimeText;
        document.getElementById('wh-inhalation-value').textContent = whState.inhalationLength;
        document.getElementById('wh-exhalation-value').textContent = whState.exhalationLength;
        document.getElementById('wh-breaths-value').textContent = whState.breathsCount;

        // Форматируем значение задержки дыхания
        const holdTimeText = whState.holdTime === 0 ? '∞' : holdPhaseTime + '';
        document.getElementById('wh-hold-value').textContent = holdTimeText;

        document.getElementById('wh-recovery-value').textContent = whState.recoveryInhaleTime;
        document.getElementById('wh-rounds-value').textContent = whState.rounds;
        document.getElementById('wh-session-duration').textContent = sessionTimeText;
    }

    updateWimHofCycleSummary();


    document.querySelectorAll('.preset-btn').forEach(button => {
        button.addEventListener('click', function () {
            const value = parseInt(this.dataset.value);
            whState.holdTime = value;
            holdTimeInput.value = value;
            saveWhSettings();
            updateWimHofCycleSummary();
        });
    });


    const templateButtons = document.querySelectorAll('.template-btn');

    // Определяем шаблоны с настройками
    const templates = {
        beginner: {
            name: '1 минута',
            icon: 'leaf',
            inhalationLength: 4.5,
            exhalationLength: 4.5,
            breathsCount: 30,
            rounds: 3,
            holdTime: 60,
            recoveryInhaleTime: 20
        },
        classic: {
            name: '1.5 минуты',
            icon: 'water',
            inhalationLength: 4.5,
            exhalationLength: 4.5,
            breathsCount: 30,
            rounds: 3,
            holdTime: 90,
            recoveryInhaleTime: 20
        },
        advanced: {
            name: '2 минуты',
            icon: 'fire',
            inhalationLength: 4.5,
            exhalationLength: 4.5,
            breathsCount: 30,
            rounds: 3,
            holdTime: 120,
            recoveryInhaleTime: 20
        },
        quick: {
            name: '3 минуты',
            icon: 'bolt',
            inhalationLength: 4.5,
            exhalationLength: 4.5,
            breathsCount: 30,
            rounds: 3,
            holdTime: 180,
            recoveryInhaleTime: 20
        },
        extendedStart: {
            name: 'Расширенное дыхание',
            icon: 'lungs',
            inhalationLength: 16,
            exhalationLength: 16,
            breathsCount: 60,
            rounds: 1,
            holdTime: 60,
            recoveryInhaleTime: 20
        },
        boom: {
            name: 'Взрывное дыхание',
            icon: 'bomb',
            inhalationLength: 24,
            exhalationLength: 2.5,
            breathsCount: 60,
            rounds: 1,
            holdTime: 120,
            recoveryInhaleTime: 25
        }
    };



    // Обработчик нажатия на кнопку шаблона
    templateButtons.forEach(button => {
        button.addEventListener('click', function () {
            const templateName = this.dataset.template;
            const templateSettings = templates[templateName];

            if (templateSettings) {
                // Устанавливаем активный класс только для выбранной кнопки
                templateButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Применяем настройки шаблона
                applyTemplate(templateSettings);
            }
        });
    });

    // Функция для генерации кнопок шаблонов
    function generateTemplateButtons() {
        const templateButtonsContainer = document.querySelector('.template-buttons');
        if (!templateButtonsContainer) return;

        // Очищаем контейнер
        templateButtonsContainer.innerHTML = '';

        // Создаем кнопки для каждого шаблона
        for (const [id, template] of Object.entries(templates)) {
            const button = document.createElement('button');
            button.className = 'template-btn';
            button.dataset.template = id;

            button.innerHTML = `<i class="fas fa-${template.icon || 'star'}"></i> ${template.name}`;

            templateButtonsContainer.appendChild(button);
        }

        // Добавляем обработчики событий для новых кнопок
        document.querySelectorAll('.template-btn').forEach(button => {
            button.addEventListener('click', function () {
                const templateName = this.dataset.template;
                const templateSettings = templates[templateName];

                if (templateSettings) {
                    // Устанавливаем активный класс только для выбранной кнопки
                    document.querySelectorAll('.template-btn').forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');

                    // Применяем настройки шаблона
                    applyTemplate(templateSettings);
                }
            });
        });
    }

    // Вызываем функцию генерации кнопок
    generateTemplateButtons();

    // Функция применения шаблона
    function applyTemplate(settings) {
        // Обновляем значения в интерфейсе
        document.getElementById('wh-inhalation-length').value = settings.inhalationLength;
        document.getElementById('wh-exhalation-length').value = settings.exhalationLength;
        document.getElementById('wh-breaths-count').value = settings.breathsCount;
        document.getElementById('wh-rounds').value = settings.rounds;
        document.getElementById('wh-hold-time').value = settings.holdTime;
        document.getElementById('wh-recovery-inhale-time').value = settings.recoveryInhaleTime;

        // Обновляем состояние приложения
        if (whState) {
            whState.inhalationLength = settings.inhalationLength;
            whState.exhalationLength = settings.exhalationLength;
            whState.breathsCount = settings.breathsCount;
            whState.rounds = settings.rounds;
            whState.holdTime = settings.holdTime;
            whState.recoveryInhaleTime = settings.recoveryInhaleTime;

            // Сохраняем настройки
            saveWhSettings();

            // Обновляем отображение
            updateWhTotalBreaths();
            updateWhTotalRounds();
            updateWimHofCycleSummary();
        }
    }



});