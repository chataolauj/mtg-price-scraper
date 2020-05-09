<template>
    <div id="home">
        <Snackbar :snack="snackbar"/>
        <h1>Home</h1>
        <Search id="search" @selected_card="scrape" :loading="isLoading" :cardAdded="clearSearch"/>
    </div>
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
            
            await this.$http.post('/scrape-list', card)
            .then(async (response) => {
                if(response.status == 200 || response.status == 204) {
                    await this.$http.put('/scrape-list/card', card)
                    .then(() => {
                        this.isLoading = false;
                        this.clearSearch = !this.clearSearch;
                        this.$router.push({name: 'scrape-results', params: {
                            card: card, 
                            card_set: card.set_name.toLowerCase().replace(/:?,?\s+/g, "-"), 
                            card_name: card.name.toLowerCase().replace(/:?,?\s+/g, "-")
                        }});
                    })
                    .catch(error => {
                        console.log(error.response)

                        this.isLoading = false;

                        this.snackbar = {
                            msg: error.response.data.message,
                            color: 'error',
                            close_color: 'white',
                            show: true
                        }
                    });
                }
            })
            .catch(error => {
                console.log(error.response)

                this.isLoading = false;

                this.snackbar = {
                    msg: error.response.data.message,
                    color: 'error',
                    close_color: 'white',
                    show: true
                }
            });
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