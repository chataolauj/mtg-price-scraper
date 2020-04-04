<template>
    <div>
        <h1>Login</h1>
        <ul v-if="error != ''">
            <li>{{ error }}</li>
        </ul>
        <input v-model='user.email' type='email' name='email' placeholder='Email' />
        <br>
        <input @keyup.enter="login(user)" v-model='user.password' type='password' name='password' placeholder='Password' />
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
            error: ''
        }
    },
    methods: {
        async login(user) {
            try {
                await AuthService.login(user)
                .then(response => {
                    console.log(response.data);
                    this.$router.push({ name: 'home' })
                })
                .catch(error => {
                    this.error = error.response.data.message;
                    console.log(this.error)
                });
            } catch (error) {
                this.error = error.response.data.message;
                console.log(error.response.data.message)
            }
        }
    }
}
</script>

<style lang="scss" scoped>

</style>