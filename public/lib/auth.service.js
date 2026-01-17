const AUTH_API = `${BASE_API_URL}/auth`; // http://localhost:3000/api/auth

const getAppRootUrl = () => {
    const currentScriptUrl = document.currentScript && document.currentScript.src;
    const authServiceScriptUrl =
        currentScriptUrl ||
        Array.from(document.scripts)
        .map((s) => s.src)
        .find(
            (src) =>
            src &&
            (src.includes('/lib/auth.service.js') ||
                src.endsWith('/lib/auth.service.js') ||
                src.includes('\\lib\\auth.service.js'))
        );

    // Preferred: derive from /lib/auth.service.js -> / (app root)
    if (authServiceScriptUrl) {
        return new URL('../', authServiceScriptUrl);
    }

    // Fallback: current page directory
    return new URL('./', window.location.href);
};

/**
 * @class AuthService
 *
 * Service for authentication methods.
 */
class AuthService {
    /**
     * Registers a new user.
     *
     * @param {Object} formData - { username, email, password }
     */
    register = (formData) => _post(`${AUTH_API}/register`, formData);

    /**
     * Logs a user into the application.
     *
     * @param {Object} formData - { username, password }
     */
    login = (formData) => _post(`${AUTH_API}/login`, formData);

    setExpiration = (maxExpiration) =>
        new Date(new Date().getTime() + maxExpiration * 1000);

    /**
     * Check the current user's authentication.
     */
    isAuth = () => {
        return getStorage('access_token');
    };

    /**
     * Check token's lifespan. Expireation is provided by the server.
     */
    isTokenExpired() {
        const expiryDate = getStorage('expires_in');
        const isExpired = expiryDate === new Date();

        if (isExpired) {
            localStorage.clear();
        }

        return isExpired;
    }

    /**
     * Logs the user out of the current session.
     */
    logout = (path) => {
        localStorage.clear();

        const appRootUrl = getAppRootUrl();
        window.location.href = path ?
            new URL(path, appRootUrl).toString() :
            appRootUrl.toString();
    };
}

const authService = new AuthService();