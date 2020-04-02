<template>
    <div>
        <h1>Register</h1>
        <ul v-if="error != ''" >
            <li>{{ error }}</li>
        </ul>
        <input v-model='user.email' type='email' name='email' placeholder='Email' />
        <br>
        <input v-model='user.password' type='password' name='password' placeholder='Password' />
        <br>
        <button @click="register(user)" type='submit'>Register</button>
    </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import AuthService from '../services/AuthService'

export default {
    name: 'Register',
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
        async register(user) {
            try {
                await AuthService.register(user)
                .then(result => {
                    console.log(result.data.message);
                    this.$router.push({name: 'login'});
                })
                .catch(error => {
                    switch(error.response.status) {
                        case 422:
                            this.error = error.response.data[0].msg;
                            break;
                        case 409:
                            this.error = error.response.data.error;
                            break;
                        default:
                            this.error = ''
                    }

                    console.log(error.response)
                });
            } catch (error) {
                console.error(error)
            }
        }
    }
}
</script>

<style lang="scss" scoped>

</style>