<template>
    <div id="home">
        <h1>Home</h1>
        <p v-if="this.$store.state.logged_in">Hello {{ this.$store.state.user.email }}</p>
        <Search id="search"/>
    </div>
</template>

<script>
import Search from '../components/Search'

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
#home {
    height: 100%;
    
    #search {
        width: 650px;
        margin: 0 auto;
    }
}
</style>