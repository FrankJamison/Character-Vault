(() => {
    const getAppRootUrl = () => {
        const currentScriptUrl = document.currentScript && document.currentScript.src;
        const guardScriptUrl =
            currentScriptUrl ||
            Array.from(document.scripts)
            .map((s) => s.src)
            .find(
                (src) =>
                src &&
                (src.includes('/lib/auth.guard.js') ||
                    src.endsWith('/lib/auth.guard.js') ||
                    src.includes('\\lib\\auth.guard.js'))
            );

        if (guardScriptUrl) {
            return new URL('../', guardScriptUrl);
        }

        return new URL('./', window.location.href);
    };

    const isLoginPage = window.location.pathname.endsWith('/login.html');

    if (
        !isLoginPage &&
        (!authService.isAuth() || authService.isTokenExpired())
    ) {
        alert('Sign into the app to proceed.');
        const appRootUrl = getAppRootUrl();
        window.location.href = new URL('login.html', appRootUrl).toString();
    } else if (
        isLoginPage &&
        authService.isAuth()
    ) {
        const appRootUrl = getAppRootUrl();
        window.location.href = new URL(
            'characters/characters.html',
            appRootUrl
        ).toString();
    }
})();