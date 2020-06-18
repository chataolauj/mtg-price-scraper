<template>
    <v-row id="home">
        <Snackbar :snack="snackbar"/>
        <Search id="search" @selected_card="scrape" :loading="isLoading" :cardAdded="clearSearch"/>
    </v-row>
</template>

<script>
/* eslint-disable no-unused-vars */
import Snackbar from '../components/Snackbar'
import Search from '../components/Search'

export default {
    name: 'Home',
    components: {
        Snackbar,
        Search
    },
    data() {
        return {
            snackbar: {},
            clearSearch: false,
            isLoading: false
        }
    },
    methods: {
        async scrape(card) {
            this.isLoading = true;

            try {
                await this.$store.dispatch('scrape', card)
                .then(() => {
                    this.isLoading = false;
                    this.clearSearch = !this.clearSearch;
                    this.$router.push({name: 'scrape-results', params: {
                        set_name: card.set_name.toLowerCase().replace(/:?,?\s+/g, "-"), 
                        card_name: card.name.toLowerCase().replace(/:?,?\s+/g, "-")
                    }});
                });
            } catch (error) {
                console.log(error.response)

                this.isLoading = false;
                this.clearSearch = !this.clearSearch;

                this.snackbar = {
                    msg: error.response.data.message,
                    color: 'error',
                    close_color: 'white',
                    show: true
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
#home {
    #search {
        width: 600px;
        margin: 0 auto;
        padding-top: 200px;
    }
}
</style>