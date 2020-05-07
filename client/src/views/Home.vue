<template>
    <div id="home">
        <h1>Home</h1>
        <Search id="search" @selected_card="scrape" :loading="isLoading" :cardAdded="clearSearch"/>
    </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import Search from '../components/Search'

export default {
    name: 'Home',
    components: {
        Search
    },
    data() {
        return {
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
                        
                        this.$router.push({name: 'scrape-results', params: { card: card } });
                    })
                    .catch(error => {
                        console.log(error.response)

                        this.isLoading = false;
                    });
                }
            })
            .catch(error => {
                console.log(error.response)

                this.isLoading = false;
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