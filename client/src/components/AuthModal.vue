<template>
    <v-dialog 
        v-model="dialog" 
        :max-width="$vuetify.breakpoint.xsOnly ? '100%' : $vuetify.breakpoint.sm ? '50%' : $vuetify.breakpoint.md ? '35%' : '25%'" 
        persistent
    >
        <template v-slot:activator="{ on: click }">
            <v-btn 
                id="auth-btn" class="px-0" :ripple="false" v-on="click" 
                x-large text absolute :icon="$vuetify.breakpoint.mdAndDown" right
            >
                <v-icon :small="$vuetify.breakpoint.lgAndUp" color="black">mdi-login-variant</v-icon>
                {{ $vuetify.breakpoint.lgAndUp ? 'Login' : '' }}
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
                            <v-alert v-if="login_error.length" dense type="error">{{login_error}}</v-alert>
                            <v-row>
                                <v-col cols="12"> <!-- Email -->
                                    <v-text-field 
                                        v-model="login_creds.email" label="Email" @keyup.enter="login(login_creds)"
                                        :disabled="isLoading" hide-details required
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12"> <!-- Password -->
                                    <v-text-field 
                                        v-model="login_creds.password" @keyup.enter="login(login_creds)" 
                                        @click:append="show_login_pass = !show_login_pass" 
                                        label="Password" :type="show_login_pass ? 'text' : 'password'" required 
                                        :append-icon="show_login_pass ? 'mdi-eye' : 'mdi-eye-off'" 
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
                        <v-container class="pb-5">
                            <div v-if="register_error != ''"> <!-- Register Errors -->
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
                                        v-model="register_creds.email" label="Email" @keyup.enter="register(register_creds)"
                                        :disabled="isLoading" hide-details required class="pt-0"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12"> <!-- Password -->
                                    <v-text-field 
                                        v-model="register_creds.password" @keyup.enter="register(register_creds)"
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
            if(this.login_creds.email == '' || this.login_creds.password == '') {
                return this.login_error = 'All fields are required.'
            }

            this.isLoading = true;

            try {
                await this.$store.dispatch('login', login_creds)
                .then(response => {
                    this.isLoading = false;
                })
                .catch(error => {
                    this.isLoading = false;
                    this.login_error = error.response.data?.message;
                });
            } catch (error) {
                this.isLoading = false;
                this.login_error = error.response.data?.message;
            }
        },
        async register(register_creds) {
            if(this.register_creds.email == '' || this.register_creds.password == '' || this.register_creds.confirm_pw == '') {
                return this.register_error = 'All fields are required.'
            }

            this.isLoading = true;

            try {
                await this.$store.dispatch('register', register_creds)
                .then(response => {
                    this.isLoading = false;
                })
                .catch(error => {
                    this.isLoading = false;
                    this.register_error = error;
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
    font-size: 1.05em;

    &::before {
        color: transparent;
  }
}
</style>