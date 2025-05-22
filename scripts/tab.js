const BACKGROUND_MUSIC_VOLUME = 0.03;

// Функционал для выпадающего меню практик
document.addEventListener('DOMContentLoaded', () => {
    const practicesTab = document.getElementById('practices-tab');
    const dropdownContent = document.querySelector('.dropdown-content');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const recommendationsButton = document.querySelector('.tab-button[data-tab="recommendations"]');
    let currentPractice = 'practice'; // По умолчанию "Квадратичное дыхание"

    // Функция для получения параметра из URL
    function getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Функция для установки параметра в URL
    function setUrlParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.replaceState({}, '', url);
    }

    // Проверяем наличие необходимых элементов
    if (!practicesTab || !dropdownContent) {
        console.error('Не найдены необходимые элементы навигации');
        return; // Прерываем выполнение если элементы не найдены
    }

    // Функция для обновления названия активной практики
    function updatePracticeTabName() {
        const activePractice = document.querySelector('.dropdown-item.active');
        if (activePractice) {
            practicesTab.innerHTML = activePractice.textContent + ' <i class="fas fa-chevron-down"></i>';
        }
    }

    // Функция для активации вкладки
    function activateTab(tabId) {
        // Деактивировать все вкладки
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Деактивировать все кнопки вкладок
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

        // Если это вкладка рекомендаций
        if (tabId === 'recommendations') {
            const recommendationsTab = document.getElementById('recommendations');
            if (recommendationsTab) {
                recommendationsTab.classList.add('active');
                recommendationsButton.classList.add('active');
                setUrlParam('tab', 'recommendations');
            }
            return;
        }

        // Если это одна из практик
        const tabElement = document.getElementById(tabId);
        if (tabElement) {
            tabElement.classList.add('active');
            practicesTab.classList.add('active');

            // Обновить активный элемент в выпадающем меню
            dropdownItems.forEach(item => {
                item.classList.toggle('active', item.dataset.tab === tabId);
            });

            updatePracticeTabName();
            setUrlParam('tab', tabId);
        }
    }

    // Инициализация с квадратичным дыханием по умолчанию
    updatePracticeTabName();

    // Проверяем параметр tab в URL при загрузке страницы
    const tabFromUrl = getUrlParam('tab');
    if (tabFromUrl) {
        activateTab(tabFromUrl);
    }

    // Открытие/закрытие выпадающего меню при клике на таб "Практики"
    practicesTab.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownContent.classList.toggle('show');
    });

    // Закрытие выпадающего меню при клике вне меню
    document.addEventListener('click', (e) => {
        if (!practicesTab.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove('show');
        }
    });

    // Обработка выбора практики из выпадающего меню
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Удаляем активный класс со всех элементов
            dropdownItems.forEach(item => item.classList.remove('active'));

            // Добавляем активный класс выбранному элементу
            item.classList.add('active');

            // Закрываем выпадающее меню
            dropdownContent.classList.remove('show');

            // Обновляем название активной практики
            updatePracticeTabName();

            // Активируем соответствующую вкладку
            const tab = item.dataset.tab;
            activateTab(tab);
        });
    });

    // Обработчик для кнопки "Рекомендации"
    if (recommendationsButton) {
        recommendationsButton.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab('recommendations');
        });
    }

    // Обработчик для переключения на вкладку практик при клике на кнопку "Практики"
    practicesTab.addEventListener('click', (e) => {
        const activeDropdownItem = document.querySelector('.dropdown-item.active');
        if (activeDropdownItem && !dropdownContent.contains(e.target)) {
            e.preventDefault();
            const tab = activeDropdownItem.dataset.tab;
            activateTab(tab);
        }
    });

    let deferredInstallPrompt;

    // Слушаем событие beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        // Предотвращаем появление баннера по умолчанию
        e.preventDefault();
        // Сохраняем событие для использования позже
        deferredInstallPrompt = e;

        // Создаем кнопку установки
        const installBtn = document.createElement('button');
        installBtn.className = 'btn primary';
        installBtn.style.position = 'fixed';
        installBtn.style.bottom = '20px';
        installBtn.style.right = '20px';
        installBtn.style.zIndex = '9999';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Установить приложение';

        installBtn.addEventListener('click', (e) => {
            // Показываем баннер установки
            if (deferredInstallPrompt) {
                deferredInstallPrompt.prompt();

                // Ждем ответа пользователя
                deferredInstallPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Пользователь установил приложение');
                    } else {
                        console.log('Пользователь отклонил установку');
                    }
                    // Обнуляем переменную
                    deferredInstallPrompt = null;

                    // Удаляем кнопку после попытки установки
                    document.body.removeChild(installBtn);
                });
            }
        });

        // Добавляем кнопку на страницу
        document.body.appendChild(installBtn);
    });
});