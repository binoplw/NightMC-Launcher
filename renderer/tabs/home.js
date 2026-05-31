    // ЗАПУСК MINECRAFT (обновлённая версия)
    if (launchBtn) {
        launchBtn.addEventListener('click', async () => {
            const selectedVersion = versionSelect.value;
            if (!selectedVersion || selectedVersion === 'Загрузка версий...') {
                showNotification('Выберите версию Minecraft', 'error');
                return;
            }
            
            // Определяем тип входа
            const loginType = document.querySelector('input[name="loginType"]:checked').value;
            let username = '';
            let uuid = '';
            
            if (loginType === 'microsoft') {
                username = localStorage.getItem('nightmc_ms_username') || 'NightMC_Player';
                uuid = localStorage.getItem('nightmc_ms_uuid') || '00000000-0000-0000-0000-000000000001';
                showNotification('Запуск с лицензионной учётной записью...', 'info');
            } else {
                username = localStorage.getItem('nightmc_offline_nick') || 'NightMC_Player';
                uuid = generateOfflineUUID(username);
                showNotification(`Запуск в оффлайн режиме: ${username}`, 'info');
            }
            
            // Получаем настройки RAM
            let ram = parseInt(localStorage.getItem('nightmc_ram') || '2048');
            let jvmArgs = localStorage.getItem('nightmc_jvm') || '-Xmx2G -XX:+UseG1GC';
            
            // Получаем максимальную RAM (80% от системы)
            if (window.nightMC && window.nightMC.system) {
                const totalRAM = await window.nightMC.system.getRAM().catch(() => 8192);
                const maxRAM = Math.floor(totalRAM * 0.8);
                if (ram > maxRAM) ram = maxRAM;
            }
            
            // ЗАПУСК через лаунчер
            if (window.NightMC && window.NightMC.launcher) {
                const success = await window.NightMC.launcher.launch(
                    selectedVersion,
                    username,
                    uuid,
                    ram,
                    jvmArgs,
                    null // serverIp (можно добавить позже)
                );
                
                if (success) {
                    addToDevConsole(`Запуск Minecraft ${selectedVersion} выполнен`, 'success');
                }
            } else {
                // Fallback если лаунчер не загрузился
                setTimeout(() => {
                    showNotification(`🚀 Запуск Minecraft ${selectedVersion} с ${ram}MB RAM!`, 'success');
                    addToDevConsole(`Запуск: версия=${selectedVersion}, пользователь=${username}, RAM=${ram}MB`, 'info');
                }, 500);
            }
        });
    }