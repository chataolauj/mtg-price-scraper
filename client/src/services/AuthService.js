import connector from './connector'

function register(user) {
    return connector().post('/register', user);
}

function login(user) {
    return connector().post('/login', user);
}

export default {
    register,
    login
}