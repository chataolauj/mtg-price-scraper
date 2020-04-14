<template>
    <div>
        <h1>Home</h1>
        <button v-if="this.$store.state.logged_in" @click="logout()" type="submit">Logout</button>
        <p v-if="this.$store.state.logged_in">Hello {{ this.$store.state.user.email }}</p>

        <Search />
    </div>
</template>

<script>
import Search from './Search'

export default {
    name: 'Home',
    components: {
        Search
    },
    data() {
        return {
            
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