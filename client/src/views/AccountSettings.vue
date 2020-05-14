<template>
    <v-row>
        <Snackbar :snack="snackbar"/>
        <h1>Account Settings</h1>
        <v-col cols="12"> <!-- Change Email -->
            <h2>Change Email</h2>

            <v-divider class="mb-5"></v-divider>

            <div v-if="email_error != ''">
                <v-alert dense type="error">{{ email_error }}</v-alert>
            </div>
            <v-row>
                <v-col cols="6">
                    <v-text-field 
                        v-model="email_creds.new_email" outlined
                        label="New Email" type="email" required 
                        :disabled="isLoading"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="4">
                    <v-btn color="info" 
                        @click="changeEmail()"
                        :loading="isLoading"
                    >
                        Update Email
                    </v-btn>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12"> <!-- Change Password -->
            <h2>Change Password</h2>

            <v-divider class="mb-5"></v-divider>
            
            <div v-if="password_errors != ''"> <!-- Password Errors -->
                <v-alert dense type="error" v-if='!Array.isArray(password_errors)'>{{ password_errors }}</v-alert>
                <div v-if="curr_pw_errors.length">
                    <v-alert dense type="error" v-for='(err, index) in curr_pw_errors' :item='err' :key='index'>{{ err.msg }}</v-alert>
                </div>
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
                        v-model="password_creds.curr_password" outlined
                        label="Current Password" :type="show_curr_pass ? 'text' : 'password'" required 
                        :append-icon="show_curr_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_curr_pass = !show_curr_pass"
                        :disabled="isLoading"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field 
                        v-model="password_creds.new_password" outlined
                        label="New Password" :type="show_new_pass ? 'text' : 'password'" required 
                        :append-icon="show_new_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_new_pass = !show_new_pass"
                        :disabled="isLoading"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field 
                        v-model="password_creds.confirm_new_pw" outlined
                        label="Confirm New Password" :type="show_confirm_new ? 'text' : 'password'" required 
                        :append-icon="show_confirm_new ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_confirm_new = !show_confirm_new"
                        :disabled="isLoading"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="4">
                    <v-btn color="info" 
                        @click="changePassword()"
                        :loading="isLoading"
                    >
                        Update Password
                    </v-btn>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12"> <!-- Delete Account -->
            <h2>Delete Account</h2>

            <v-divider class="mb-5"></v-divider>

            <v-btn color="error">Delete Account</v-btn>
        </v-col>
    </v-row>
</template>

<script>
import Snackbar from '../components/Snackbar'

export default {
    name: 'AccountSettings',
    components: {
        Snackbar
    },
    data() {
        return {
            email_creds: {
                curr_email: this.$store.state.user.email,
                new_email: ''
            },
            password_creds: {
                curr_password: '',
                new_password: '',
                confirm_new_pw: ''
            },
            show_curr_pass: false,
            show_new_pass: false,
            show_confirm_new: false,
            isLoading: false,
            email_error: '',
            password_errors: '',
            snackbar: {}
        }
    },
    computed: {
        curr_pw_errors() {
            if(Array.isArray(this.password_errors)) {
                return this.password_errors.filter(error => error.param === 'curr_password');
            }

            return [];
        },
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
        async changePassword() {
            if(this.password_creds.curr_password == '' || this.password_creds.new_password == '' || this.password_creds.confirm_new_pw == '') {
                return this.password_errors = 'All fields are required.';
            }
            
            this.isLoading = true;

            await this.$http.patch(`/users/${this.$store.state.user._id}/change-password`, this.password_creds)
            .then(response => {
                this.isLoading = false;

                this.password_creds = {
                    curr_password: '',
                    new_password: '',
                    confirm_new_pw: ''
                }

                this.password_errors = '';

                this.show_curr_pass = false
                this.show_new_pass = false
                this.show_confirm_new = false

                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }
            })
            .catch(error => {
                this.isLoading = false;
                this.password_errors = error.response.data;
                console.log(error.response)
            });
        },
        async changeEmail() {
            if(this.email_creds.new_email == '') {
                return this.email_error = 'New Email field is required.';
            }

            this.isLoading = true;

            await this.$http.patch(`/users/${this.$store.state.user._id}/change-email`, this.email_creds)
            .then(response => {
                this.isLoading = false;
                
                this.$store.commit('change_email', this.email_creds.new_email);
                this.email_error = '';
                this.email_creds.new_email = ''

                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }
            })
            .catch(error => {
                this.isLoading = false;
                this.email_error = error.response.data[0].msg;
            });
        }
    }
}
</script>

<style lang="scss" scoped>

</style>