const doLogin = async (e) => {
    e.preventDefault();

    const username = document.getElementById('formInputUsername').value;
    const password = document.getElementById('formInputPassword').value;

    try {
        const res = await authService.login({
            username,
            password
        });
        const {
            auth,
            expires_in,
            access_token,
            refresh_token,
            msg
        } = res;
        const expiryDate = authService.setExpiration(expires_in);

        if (auth) {
            setStorage('isAuth', auth);
            setStorage('expires_in', expiryDate);
            setStorage('access_token', access_token);
            setStorage('refresh_token', refresh_token);

            window.location.href = 'characters/characters.html';
        } else {
            console.log(msg);
            alert(msg);
        }
    } catch (err) {
        alert('Failed to login. Please try again later.');
    }
};

const doRegister = async (e) => {
    e.preventDefault();

    const username = document.getElementById('formInputUsernameReg').value;
    const email = document.getElementById('formInputEmailReg').value;
    const password = document.getElementById('formInputPasswordReg').value;

    try {
        const res = await authService.register({
            username,
            email,
            password,
        });

        if (res) {
            window.location.href = '/';
        }
    } catch (err) {
        alert('Failed to register. Please try again later.');
    }
};

const doLogout = (e) => {
    e.preventDefault();
    authService.logout();
};

(async () => {
    const login = document.getElementById('login');
    const logout = document.getElementById('logout');
    const username = document.getElementById('header-username');

    if (authService.isAuth()) {
        if (login) {
            login.style.display = 'none';
            if (logout) {
                logout.style.display = 'block';
            }
        }
    } else {
        if (login) {
            login.style.display = 'block';
        }
        if (logout) {
            logout.style.display = 'none';
        }
    }

    // Only fetch/paint the current user if the page actually has a username slot.
    if (authService.isAuth() && username) {
        try {
            await userService.getMe().then(([user]) => {
                const usernameText = document.createTextNode(user.username);
                username.appendChild(usernameText);
            });
        } catch (err) {
            console.log(err);
            alert('Could not get the current user.');
        }
    }
})();