<template>
    <div>
        <h1>Login</h1>
        <ul v-if="error.length">
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
                await this.$store.dispatch('login', user)
                .then(response => {
                    console.log(response);
                    console.log(this.$store.state.user)
                    this.$router.push('/');
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