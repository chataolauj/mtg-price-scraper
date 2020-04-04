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
            <ul v-if="confirm_pw_errors.length && !pw_errors.length">
                <li>Your passwords do not match.</li>
            </ul>
        </div>
        <input @keyup.enter='register(credentials)' v-model='credentials.email' type='email' name='email' placeholder='Email' />
        <br>
        <input @keyup.enter='register(credentials)' v-model='credentials.password' type='password' name='password' placeholder='Password' />
        <br>
        <input @keyup.enter='register(credentials)' v-model='credentials.confirm_pw' type='password' name='confirm_pw' placeholder='Confirm Password' />
        <br>
        <button @click="register(credentials)" type='submit'>Register</button>
    </div>
</template>

<script>
/* eslint-disable no-unused-vars */

export default {
    name: 'Register',
    data() {
        return {
            credentials: {
                email: '',
                password: '',
                confirm_pw: ''
            },
            error: ''
        }
    },
    computed: {
        email_errors() {
            if(Array.isArray(this.error)) {
                return this.error.filter(error => error.param === 'email');
            }

            return [];
        },
        pw_errors() {
            if(Array.isArray(this.error)) {
                return this.error.filter(error => error.param === 'password');
            }

            return [];
        },
        confirm_pw_errors() {
            if(Array.isArray(this.error)) {
                return this.error.filter(error => error.param === 'confirm_pw');
            }

            return [];
        }
    },
    methods: {
        async register(credentials) {
            try {
                await this.$http.post('/register', credentials)
                .then(response => {
                    console.log(response.data.message);
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