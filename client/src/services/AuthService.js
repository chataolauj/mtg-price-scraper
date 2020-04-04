import connector from './connector'

function register(credentials) {
    return connector().post('/register', credentials);
}

function login(credentials) {
    return connector().post('/login', credentials);
}

function logout() {
    return connector().get('/logout');
}

function check_auth() {
    return connector().get('/check_auth')
}

export default {
    register,
    login,
    check_auth,
    logout
}