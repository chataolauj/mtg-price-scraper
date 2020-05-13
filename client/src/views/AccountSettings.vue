<template>
    <v-row>
        <Snackbar :snack="snackbar"/>
        <h1>Account Settings</h1>
        <v-col cols="12"> <!-- Change Email -->
            <h2>Change Email</h2>

            <v-divider class="mb-5"></v-divider>
        </v-col>
        <v-col cols="12"> <!-- Change Password -->
            <h2>Change Password</h2>

            <v-divider class="mb-5"></v-divider>
            
            <div v-if="update_errors != ''">
                <v-alert dense type="error" v-if='!Array.isArray(update_errors)'>{{ update_errors }}</v-alert>
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
                        v-model="update_creds.curr_password" 
                        label="Current Password" :type="show_curr_pass ? 'text' : 'password'" required 
                        :append-icon="show_curr_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_curr_pass = !show_curr_pass"
                        :disabled="isLoading"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field 
                        v-model="update_creds.new_password" 
                        label="New Password" :type="show_new_pass ? 'text' : 'password'" required 
                        :append-icon="show_new_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_new_pass = !show_new_pass"
                        :disabled="isLoading"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="6">
                    <v-text-field 
                        v-model="update_creds.confirm_new_pw" 
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
            update_creds: {
                email: this.$store.state.user.email,
                curr_password: '',
                new_password: '',
                confirm_new_pw: ''
            },
            show_curr_pass: false,
            show_new_pass: false,
            show_confirm_new: false,
            isLoading: false,
            update_errors: '',
            snackbar: {}
        }
    },
    computed: {
        curr_pw_errors() {
            if(Array.isArray(this.update_errors)) {
                return this.update_errors.filter(error => error.param === 'curr_password');
            }

            return [];
        },
        new_pw_errors() {
            if(Array.isArray(this.update_errors)) {
                return this.update_errors.filter(error => error.param === 'new_password');
            }

            return [];
        },
        confirm_new_pw_errors() {
            if(Array.isArray(this.update_errors)) {
                return this.update_errors.filter(error => error.param === 'confirm_new_pw');
            }

            return [];
        }
    },
    methods: {
        async changePassword() {
            if(this.update_creds.curr_password == '' || this.update_creds.new_password == '' || this.update_creds.confirm_new_pw == '') {
                this.update_errors = 'All fields are required.';
                return;
            }
            
            this.isLoading = true;

            await this.$http.patch('/change-password', this.update_creds)
            .then(response => {
                this.isLoading = false;

                this.update_creds = {
                    email: this.$store.state.user.email,
                    curr_password: '',
                    new_password: '',
                    confirm_new_pw: ''
                }

                this.update_errors = '';

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
                this.update_errors = error.response.data;
                console.log(error.response)
            });
        }
    }
}
</script>

<style lang="scss" scoped>

</style>