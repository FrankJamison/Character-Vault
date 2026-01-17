(function() {
    const storageKey = 'theme';
    const root = document.documentElement;

    function getSavedTheme() {
        try {
            return localStorage.getItem(storageKey);
        } catch {
            return null;
        }
    }

    function setSavedTheme(value) {
        try {
            if (!value) {
                localStorage.removeItem(storageKey);
            } else {
                localStorage.setItem(storageKey, value);
            }
        } catch {
            // ignore
        }
    }

    function getCurrentTheme() {
        // Dark is the default if nothing is set.
        return root.dataset.theme === 'light' ? 'light' : 'dark';
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            root.dataset.theme = 'light';
            setSavedTheme('light');
        } else {
            // Treat anything else as dark.
            root.dataset.theme = 'dark';
            setSavedTheme('dark');
        }
    }

    function updateToggleLabel(toggleEl) {
        const current = getCurrentTheme();
        const next = current === 'dark' ? 'light' : 'dark';

        toggleEl.textContent = current === 'dark' ? 'Light Mode' : 'Dark Mode';
        toggleEl.setAttribute('aria-label', `Switch to ${next} mode`);
        toggleEl.setAttribute('title', `Switch to ${next} mode`);
    }

    // Apply saved theme early.
    const saved = getSavedTheme();
    if (saved === 'light' || saved === 'dark') {
        applyTheme(saved);
    } else {
        // Default to dark.
        applyTheme('dark');
    }

    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    updateToggleLabel(toggle);
    toggle.addEventListener('click', function() {
        const current = getCurrentTheme();
        applyTheme(current === 'dark' ? 'light' : 'dark');
        updateToggleLabel(toggle);
    });
})();