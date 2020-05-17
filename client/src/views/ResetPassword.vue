<template>
    <v-row>
        <Snackbar :snack="snackbar"/>
        <div v-if="!tokenExpired"> <!-- Change Password -->
            <v-col>
                <h2>Reset Password</h2>
            </v-col>
            <v-col cols="12">
                <p>Enter the email your registered with MTG Price Scraper and we'll send you instructions on how to reset your password.</p>

                <div v-if="password_errors != ''"> <!-- Password Errors -->
                    <v-alert dense type="error" v-if='!Array.isArray(password_errors)'>{{ password_errors }}</v-alert>
                    <div v-if="new_pw_errors.length">
                        <v-alert dense type="error">Your new password must meet the following requirements:
                            <v-list-item v-for='(err, index) in new_pw_errors' :item='err' :key='index'>- {{ err.msg }}</v-list-item>
                        </v-alert>
                    </div>
                    <div v-if="confirm_new_pw_errors.length && !new_pw_errors.length">
                        <v-alert dense type="error">Your new passwords do not match.</v-alert>
                    </div>
                </div>
                <v-row>
                    <v-col cols="6">
                        <v-text-field 
                            v-model="password_creds.new_password" @keyup.enter="changePassword()" outlined
                            label="New Password" :type="show_new_pass ? 'text' : 'password'" required 
                            :append-icon="show_new_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_new_pass = !show_new_pass"
                            :disabled="pwLoading"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-text-field 
                            v-model="password_creds.confirm_new_pw" @keyup.enter="changePassword()" outlined
                            label="Confirm New Password" :type="show_confirm_new ? 'text' : 'password'" required 
                            :append-icon="show_confirm_new ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_confirm_new = !show_confirm_new"
                            :disabled="pwLoading"
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="4">
                        <v-btn color="info" 
                            @click="changePassword()"
                            :loading="pwLoading"
                        >
                            Update Password
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </div>
        <div v-else> <!-- Email Sent/Resend Email -->
            <v-col>
                <h2>Reset Password</h2>
            </v-col>
            <v-col cols="12">
                <p class="pb-3">The time to reset your password has expired.</p>
                <p>To reset your password again, please <router-link to="/forgot-password">click here.</router-link></p>
            </v-col>
        </div>
    </v-row>
</template>

<script>
import Snackbar from '../components/Snackbar'

export default {
    name: 'ResetPassword',
    components: {
        Snackbar
    },
    props: {
        token: String
    },
    data() {
        return {
            snackbar: {},
            tokenExpired: false,
            expired_msg: '',
            password_creds: {
                new_password: '',
                confirm_new_pw: ''
            },
            show_new_pass: false,
            show_confirm_new: false,
            pwLoading: false,
            password_errors: ''
        }
    },
    created() {
        this.checkToken();
    },
    computed: {
        new_pw_errors() {
            if(Array.isArray(this.password_errors)) {
                return this.password_errors.filter(error => error.param === 'new_password');
            }

            return [];
        },
        confirm_new_pw_errors() {
            if(Array.isArray(this.password_errors)) {
                return this.password_errors.filter(error => error.param === 'confirm_new_pw');
            }

            return [];
        }
    },
    methods: {
        async checkToken() {
            this.$http.get(`/reset-password/${this.token}`).catch(() => {
                this.tokenExpired = true;
            });
        },
        async changePassword() {
            if(this.password_creds.new_password == '' || this.password_creds.confirm_new_pw == '') {
                return this.password_errors = 'All fields are required.';
            }
            
            this.pwLoading = true;

            await this.$http.patch(`/reset-password/${this.token}`, this.password_creds)
            .then(response => {
                this.pwLoading = false;

                this.password_creds = {
                    new_password: '',
                    confirm_new_pw: ''
                }

                this.password_errors = '';

                this.show_new_pass = false
                this.show_confirm_new = false

                this.$emit('reset_password', response.data.message);

                this.$router.push('/');
            })
            .catch(error => {
                this.pwLoading = false;
                this.password_errors = error.response.data;
                console.log(error.response)
            });
        }
    }
}
</script>

<style>

</style>