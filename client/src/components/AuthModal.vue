<template>
    <v-dialog v-model="dialog" max-width="25%" persistent>
        <template v-slot:activator="{ on: click }">
            <v-btn id="auth-btn" :ripple="false" v-on="click" x-large text absolute right>
                <v-icon small>mdi-login-variant</v-icon>
                Login
            </v-btn>
        </template>

        <v-card>
            <v-tabs grow v-model="tab">
                <v-tab href="#login">Login</v-tab>
                <v-tab href="#register">Register</v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item value="login"> <!-- Login Tab -->
                    <v-card>
                        <v-container>
                            <v-alert dense type="error" v-if="login_error.length">{{login_error}}</v-alert>
                            <v-row>
                                <v-col cols="12"> <!-- Email -->
                                    <v-text-field 
                                        v-model="login_creds.email" label="Email" :disabled="isLoading" 
                                        hide-details required class="pt-0"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12"> <!-- Password -->
                                    <v-text-field 
                                        v-model="login_creds.password" @keyup.enter="login(login_creds)" 
                                        label="Password" :type="show_login_pass ? 'text' : 'password'" required 
                                        :append-icon="show_login_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_login_pass = !show_login_pass"
                                        :disabled="isLoading" hide-details
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12"> <!-- Forgot Password -->
                                    <v-card-text @click="closeDialog()" class="pa-0">
                                        <router-link to="/forgot-password" style="text-decoration: none;">
                                            Forgot password?
                                        </router-link>
                                    </v-card-text>
                                </v-col>
                            </v-row>
                        </v-container>
                        <v-card-actions> <!-- Login Action Buttons -->
                            <v-spacer></v-spacer>
                            <v-btn @click="closeDialog()" color="error" :disabled="isLoading">Cancel</v-btn>
                            <v-btn @click="login(login_creds)" color="primary" :loading="isLoading">Login</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tab-item>
                <v-tab-item value="register"> <!-- Register Tab -->
                    <v-card>
                        <v-container>
                            <div v-if="register_error != ''">
                                <v-alert dense type="error" v-if='!Array.isArray(register_error)'>{{ register_error }}</v-alert>
                                <div v-else>
                                    <v-alert dense type="error" v-for='(err, index) in email_errors' :item='err' :key='index'>{{ err.msg }}</v-alert>
                                </div>
                                <div v-if="pw_errors.length">
                                    <v-alert dense type="error">The password you entered does not contain:
                                        <v-list-item v-for='(err, index) in pw_errors' :item='err' :key='index'>- {{ err.msg }}</v-list-item>
                                    </v-alert>
                                </div>
                                <div v-if="confirm_pw_errors.length && !pw_errors.length">
                                    <v-alert dense type="error">Your passwords do not match.</v-alert>
                                </div>
                            </div>
                            <v-row>
                                <v-col cols="12"> <!-- Email -->
                                    <v-text-field 
                                        v-model="register_creds.email" label="Email" :disabled="isLoading" 
                                        hide-details required class="pt-0"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12"> <!-- Password -->
                                    <v-text-field 
                                        v-model="register_creds.password" 
                                        label="Password" :type="show_regis_pass ? 'text' : 'password'" required 
                                        :append-icon="show_regis_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_regis_pass = !show_regis_pass"
                                        :disabled="isLoading" hide-details
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12"> <!-- Confirm Password -->
                                    <v-text-field 
                                        v-model="register_creds.confirm_pw" @keyup.enter="register(register_creds)" 
                                        label="Confirm Password" :type="show_confirm ? 'text' : 'password'" required
                                        :append-icon="show_confirm ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_confirm = !show_confirm"
                                        :disabled="isLoading" hide-details
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                        <v-card-actions> <!-- Register Action Buttons -->
                            <v-spacer></v-spacer>
                            <v-btn @click="closeDialog()" color="error" :disabled="isLoading">Cancel</v-btn>
                            <v-btn @click="register(register_creds)" color="success" :loading="isLoading">Register</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-card>
    </v-dialog>
</template>

<script>
/* eslint-disable no-unused-vars */

export default {
    name: 'AuthModal',
    data() {
        return {
            tab: null,
            dialog: false,
            show_login_pass: false,
            show_regis_pass: false,
            show_confirm: false,
            login_creds: {
                email: '',
                password: ''
            },
            isLoading: false,
            register_creds: {
                email: '',
                password: '',
                confirm_pw: ''
            },
            login_error: '',
            register_error: ''
        }
    },
    computed: {
        email_errors() {
            if(Array.isArray(this.register_error)) {
                return this.register_error.filter(error => error.param === 'email');
            }

            return [];
        },
        pw_errors() {
            if(Array.isArray(this.register_error)) {
                return this.register_error.filter(error => error.param === 'password');
            }

            return [];
        },
        confirm_pw_errors() {
            if(Array.isArray(this.register_error)) {
                return this.register_error.filter(error => error.param === 'confirm_pw');
            }

            return [];
        }
    },
    methods: {
        async login(login_creds) {
            this.isLoading = true;

            try {
                await this.$store.dispatch('login', login_creds)
                .then(response => {
                    this.isLoading = false;
                    console.log(this.$store.state.logged_in)
                    console.log(this.$store.state.user.email)
                })
                .catch(error => {
                    this.isLoading = false;
                    this.login_error = error.response.data.message;
                    console.log(this.login_error)
                });
            } catch (error) {
                this.isLoading = false;
                this.login_error = error.response.data.message;
                console.log(error.response.data.message)
            }
        },
        async register(register_creds) {
            this.isLoading = true;

            try {
                await this.$store.dispatch('register', register_creds)
                .then(response => {
                    this.isLoading = false;
                    console.log(response);
                    console.log(this.$store.state.user)
                })
                .catch(error => {
                    this.isLoading = false;
                    this.register_error = error;
                    console.log(this.register_error)
                });
            } catch (error) {
                this.isLoading = false;
                this.register_error = error;
            }
        },
        closeDialog() {
            this.dialog = false;
            this.login_creds.email = '';
            this.login_creds.password = '';
            this.login_error = '';
            this.register_creds.email = '';
            this.register_creds.password = '';
            this.register_creds.confirm_pw = '';
            this.register_error = '';
        }
    }
}
</script>

<style lang="scss" scoped>
#auth-btn {
    text-transform: capitalize;
    font-size: 1.1em;

    &::before {
        color: transparent;
  }
}
</style>