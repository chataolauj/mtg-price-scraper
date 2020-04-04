<template>
    <div>
        <h1>Home</h1>
        <br>
        <button v-if="logged_in" @click="logout()" type="submit">Logout</button>
    </div>
</template>

<script>

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
            await this.$axios.get('check_auth')
            .then(response => {
                this.logged_in = response.data.is_logged_in;
                console.log(response.data.is_logged_in);
            })
            .catch(error => console.log(error));
        },
        async logout() {
            await this.$axios.get('/logout')
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