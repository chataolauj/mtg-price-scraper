<template>
    <div>
        <h1>WishList</h1>
        <p>{{ this.$store.state.user.email }}'s wish list.</p>
        <button @click="logout()" type="submit">Logout</button>
    </div>
</template>

<script>
export default {
    name: 'WishList',
    data() {
        return {
            logged_in: this.$store.state.logged_in
        }
    },
    methods: {
        async logout() {
            await this.$store.dispatch('logout')
            .then(response => {
                this.$router.push('/');
                console.log(response.data.message);
            })
            .catch(error => console.log(error));
        }
    }
}
</script>

<style lang="scss" scoped>

</style>