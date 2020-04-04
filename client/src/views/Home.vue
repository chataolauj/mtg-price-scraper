<template>
    <div>
        <h1>Home</h1>
        <br>
        <button v-if="logged_in" @click="logout()" type="submit">Logout</button>
    </div>
</template>

<script>
import AuthService from '../services/AuthService'

export default {
    name: 'Home',
    data() {
        return {
            logged_in: false
        }
    },
    created() {
        this.check_auth();
    },
    methods: {
        async check_auth() {
            await AuthService.check_auth()
            .then(response => {
                this.logged_in = response.data.logged_in;
                console.log(response.data.logged_in);
            })
            .catch(error => console.log(error));
        },
        async logout() {
            await AuthService.logout()
            .then(response => {
                this.logged_in = false;
                console.log(response.data);
            })
            .catch(error => console.log(error));
        }
    }
}
</script>

<style lang="scss" scoped>

</style>