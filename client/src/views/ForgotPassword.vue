<template>
    <v-row>
        <Snackbar :snack="snackbar"/>
        <div v-if="!emailSent"> <!-- Send Email -->
            <v-col>
                <h2>Forgot your password?</h2>
            </v-col>
            <v-col cols="12">
                <p>Enter the email your registered with MTG Price Scraper and we'll send you instructions on how to reset your password.</p>

                <div v-if="email_error != ''">
                    <v-alert dense type="error">{{ email_error }}</v-alert>
                </div>
                <v-row>
                    <v-col cols="6">
                        <v-text-field 
                            v-model="email" outlined hide-details
                            label="Email" type="email" required
                        ></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="4">
                        <v-btn 
                            @click="sendEmail()"
                            color="info" :loading="isLoading"
                        >
                            Send
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </div>
        <div v-else> <!-- Email Sent/Resend Email -->
            <v-col>
                <h2>Reset Your Password</h2>
            </v-col>
            <v-col cols="12">
                <p class="pb-3">An email with instructions on how to reset your password was sent to {{email}}.</p>
                <p>Didn't receive the email? Please check your spam folder or click the button below to resend the email.</p>
                <v-row>
                    <v-col cols="4">
                        <v-btn 
                            @click="resendEmail()"
                            color="info" :loading="isLoading"
                        >
                            Resend
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </div>
    </v-row>
</template>

<script>
import Snackbar from '../components/Snackbar'

export default {
    name: 'ForgotPassword',
    components: {
        Snackbar
    },
    data() {
        return {
            snackbar: {},
            isLoading: false,
            email: '',
            emailSent: false,
            sentAgain: false,
            email_error: ''
        }
    },
    methods: {
        sendEmail() {
            if(this.email == '') {
                return this.email_error = 'Please enter an email.'
            }
            
            this.isLoading = true;

            this.$http.post('/forgot-password', {email: this.email})
            .then(response => {
                this.isLoading = false;
                this.emailSent = true;

                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }
            })
            .catch(error => {
                this.isLoading = false;
                this.email_error = error.response.data[0].msg
            });
        },
        resendEmail() {
            this.isLoading = false;

            this.$http.post('/forgot-password', {email: this.email})
            .then(() => {
                this.isLoading = false;
                this.sentAgain = true;

                this.snackbar = {
                    msg: 'Re-sent reset password email to ' + this.email,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }
            })
            .catch(error => {
                this.isLoading = false;
                this.email_error = error.response.data[0].msg
            });
        }
    }
}
</script>

<style>

</style>