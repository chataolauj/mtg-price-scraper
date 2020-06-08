<template>
    <v-row>
        <Snackbar :snack="snackbar"/>
        <v-col cols="12">
            <h1>Account Settings</h1>
        </v-col>
        <v-col cols="12"> <!-- Change Email -->
            <h2>Change Email</h2>

            <v-divider class="mb-5"></v-divider>

            <div v-if="email_error != ''">
                <v-alert dense type="error">{{ email_error }}</v-alert>
            </div>
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field 
                        v-model="email_creds.new_email" @keyup.enter="changeEmail()" outlined
                        label="New Email" type="email" required hide-details
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-btn color="info" :block="$vuetify.breakpoint.smAndDown"
                        @click="changeEmail()"
                        :loading="emailLoading"
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
                <v-col cols="12" md="6">
                    <v-text-field 
                        v-model="password_creds.curr_password" @keyup.enter="changePassword()" outlined
                        label="Current Password" :type="show_curr_pass ? 'text' : 'password'" required 
                        :append-icon="show_curr_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_curr_pass = !show_curr_pass"
                        :disabled="pwLoading" hide-details
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field 
                        v-model="password_creds.new_password" @keyup.enter="changePassword()" outlined
                        label="New Password" :type="show_new_pass ? 'text' : 'password'" required 
                        :append-icon="show_new_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_new_pass = !show_new_pass"
                        :disabled="pwLoading" hide-details
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-text-field 
                        v-model="password_creds.confirm_new_pw" @keyup.enter="changePassword()" outlined
                        label="Confirm New Password" :type="show_confirm_new ? 'text' : 'password'" required 
                        :append-icon="show_confirm_new ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_confirm_new = !show_confirm_new"
                        :disabled="pwLoading" hide-details
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-btn color="info" :block="$vuetify.breakpoint.smAndDown"
                        @click="changePassword()"
                        :loading="pwLoading"
                    >
                        Update Password
                    </v-btn>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="12"> <!-- Delete Account -->
            <h2>Delete Account</h2>

            <v-divider class="mb-5"></v-divider>

            <v-dialog v-model="deleteDialog" :max-width="$vuetify.breakpoint.smAndDown ? '75%' : '35%'" persistent >
                <template v-slot:activator="{ on: click}">
                    <v-btn v-on="click" color="error" :block="$vuetify.breakpoint.smAndDown">Delete Account</v-btn>
                </template>

                <v-card>
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-card-title class="headline">Delete Account</v-card-title>
                                <div class="px-4">
                                    <v-alert dense type="error" v-if="delete_error != ''">{{ delete_error }}</v-alert>
                                </div>
                                <v-card-text v-if="!wantToDelete" class="body-1">Are you sure you want to delete your account? This can't be undone once you do so.</v-card-text>
                                <v-text-field 
                                    v-else v-model="delete_creds.password" @keyup.enter="deleteAccount()" class="px-4"
                                    label="Password" :type="show_delete_pass ? 'text' : 'password'" required 
                                    :append-icon="show_delete_pass ? 'mdi-eye' : 'mdi-eye-off'" @click:append="show_delete_pass = !show_delete_pass"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-card-actions v-if="!wantToDelete">
                        <v-spacer></v-spacer>
                        <v-btn text @click="deleteDialog = false">No</v-btn>
                        <v-btn color="error" text @click="wantToDelete = true">Yes</v-btn>
                    </v-card-actions>
                    <v-card-actions v-else>
                        <v-spacer></v-spacer>
                        <v-btn text @click="cancelDelete()" :disabled="deleteLoading">Cancel</v-btn>
                        <v-btn @click="deleteAccount()" color="error" text :loading="deleteLoading" :disabled="delete_creds.password == ''">Delete</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
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
            snackbar: {},
            email_creds: {
                curr_email: this.$store.state.user.email,
                new_email: ''
            },
            email_error: '',
            emailLoading: false,
            password_creds: {
                curr_password: '',
                new_password: '',
                confirm_new_pw: ''
            },
            show_curr_pass: false,
            show_new_pass: false,
            show_confirm_new: false,
            pwLoading: false,
            password_errors: '',
            delete_creds: {
                email: this.$store.state.user.email,
                password: ''
            },
            deleteDialog: false,
            wantToDelete: false,
            show_delete_pass: false,
            deleteLoading: false,
            delete_error: ''
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
        async changeEmail() {
            if(this.email_creds.new_email == '') {
                return this.email_error = 'New Email field is required.';
            }

            this.emailLoading = true;
            console.log(this.email_creds)

            await this.$http.patch(`/users/${this.$store.state.user._id}/change-email`, this.email_creds)
            .then(response => {
                this.emailLoading = false;
                
                this.$store.commit('change_email', this.email_creds.new_email);
                this.email_error = '';
                this.email_creds.curr_email = this.$store.state.user.email;
                this.email_creds.new_email = ''

                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }
            })
            .catch(error => {
                console.log(this.email_creds)
                this.emailLoading = false;
                this.email_error = error.response.data[0].msg;
            });
        },
        async changePassword() {
            if(this.password_creds.curr_password == '' || this.password_creds.new_password == '' || this.password_creds.confirm_new_pw == '') {
                return this.password_errors = 'All fields are required.';
            }
            
            this.pwLoading = true;

            await this.$http.patch(`/users/${this.$store.state.user._id}/change-password`, this.password_creds)
            .then(response => {
                this.pwLoading = false;

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
                this.pwLoading = false;
                this.password_errors = error.response.data;
                console.log(error.response)
            });
        },
        async deleteAccount() {
            this.deleteLoading = true;

            await this.$http.delete(`/users/${this.$store.state.user._id}`, { data: { email: this.delete_creds.email, password: this.delete_creds.password} } )
            .then(response => {
                
                this.$store.dispatch('logout')
                .then(() => {
                    this.$emit('account_deleted', response.data.message);
                    this.$router.push('/');
                })
                .catch(error => console.log(error));
            })
            .catch(error => {
                console.log(error.response)
                this.deleteLoading = false;
                this.delete_error = error.response.data[0].msg
            });
        },
        cancelDelete() {
            this.deleteDialog = false;
            this.wantToDelete = false;
            this.show_delete_pass = false;
            this.delete_creds.password = '';
            this.delete_error = '';
        }
    }
}
</script>

<style lang="scss" scoped>

</style>