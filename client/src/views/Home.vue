<template>
    <div>
        <h1>Home</h1>
        <p v-if="this.$store.state.logged_in">Hello {{ this.$store.state.user.email }}</p>
        <button v-if="this.$store.state.logged_in" @click="logout()" type="submit">Logout</button>
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
    methods: {
        async logout() {
            await this.$store.dispatch('logout')
            .then(response => {
                console.log(response.data.message);
            })
            .catch(error => console.log(error));
        }
    }
}
</script>

<style lang="scss" scoped>

</style>