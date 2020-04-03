<template>
    <div>
        <h1>Register</h1>
        <div v-if="error != ''">
            <ul>
                <li v-if='!Array.isArray(error)'>{{ error }}</li>
                <li v-else v-for='(err, index) in email_errors' :item='err' :key='index'>{{ err.msg }}</li>
            </ul>
            <ul v-if="pw_errors.length">
            <li>The password you entered does not contain:
                <ul>
                    <li v-for='(err, index) in pw_errors' :item='err' :key='index'>{{ err.msg }}</li>
                </ul>
            </li>
        </ul>
        </div>
        <input @keyup.enter='register(user)' v-model='user.email' type='email' name='email' placeholder='Email' />
        <br>
        <input @keyup.enter='register(user)' v-model='user.password' type='password' name='password' placeholder='Password' />
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
    computed: {
        email_errors: function() {
            if(Array.isArray(this.error)) {
                return this.error.filter(error => error.param === 'email');
            }

            return [];
        },
        pw_errors: function() {
            if(Array.isArray(this.error)) {
                return this.error.filter(error => error.param === 'password');
            }

            return [];
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
                            this.error = error.response.data;
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