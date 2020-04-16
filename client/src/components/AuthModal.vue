<template>
    <v-dialog v-model="dialog" max-width="25%" persistent>
        <template v-slot:activator="{ on: click }">
            <v-btn v-on="click" x-large text absolute right>
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
                <v-tab-item value="login">
                    <v-card>
                        <v-container>
                            <v-alert dense type="error" v-if="login_error.length">{{login_error}}</v-alert>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="login_creds.email" label="Email" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field v-model="login_creds.password" @keyup.enter="login(login_creds)" label="Password" type="password" required></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="closeDialog()" color="error">Cancel</v-btn>
                            <v-btn @click="login(login_creds)" color="primary">Login</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tab-item>
                <v-tab-item value="register">
                    <v-card>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="register_creds.email" label="Email" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field v-model="register_creds.password" label="Password" type="password" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field v-model="register_creds.confirm_pw" @keyup.enter="register(register_creds)" label="Confirm Password" type="password" required></v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="closeDialog()" color="error">Cancel</v-btn>
                            <v-btn @click="register(register_creds)" color="success">Register</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: 'AuthModal',
    data() {
        return {
            tab: null,
            dialog: false,
            login_creds: {
                email: '',
                password: ''
            },
            register_creds: {
                email: '',
                password: '',
                confirm_pw: ''
            },
            login_error: '',
            register_error: null
        }
    },
    methods: {
        async login(login_creds) {
            try {
                await this.$store.dispatch('login', login_creds)
                .then(response => {
                    console.log(response);
                    console.log(this.$store.state.user)
                    //this.$router.push('/');
                })
                .catch(error => {
                    this.login_error = error.response.data.message;
                    console.log(this.login_error)
                });
            } catch (error) {
                this.login_error = error.response.data.message;
                console.log(error.response.data.message)
            }
        },
        async register(register_creds) {
            try {
                await this.$http.post('/register', register_creds)
                .then(response => {
                    console.log(response.data.message);
                    this.$router.push('/login');
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

</style>