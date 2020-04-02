<template>
    <div>
        <h1>Login</h1>
        <input v-model='user.email' type='email' name='email' placeholder='Email' />
        <br>
        <input v-model='user.password' type='password' name='password' placeholder='Password' />
        <br>
        <button @click="login(user)" type='submit'>Login</button>
    </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import AuthService from '../services/AuthService'

export default {
    name: 'Login',
    data() {
        return {
            user: {
                email: '',
                password: ''
            },
            erorr: ''
        }
    },
    methods: {
        async login(user) {
            try {
                await AuthService.login(user);
            } catch (error) {
                this.error = error.response.data;
                console.log(this.error)
            }
        }
    }
}
</script>

<style lang="scss" scoped>

</style>