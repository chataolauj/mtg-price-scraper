<template>
    <div id="home">
        <h1>Home</h1>
        <Search id="search" @selected_card="scrape" :cardAdded="clearSearch"/>
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
            card: {},
            clearSearch: false
        }
    },
    methods: {
        async scrape(card) {
            this.card = card;

            await this.$http.post('/scrape-list', this.card)
            .then(async (response) => {
                if(response.status == 200 || response.status == 204) {
                    await this.$http.put('/scrape-list/card', this.card)
                    .then(() => {
                        this.clearSearch = !this.clearSearch;
                        
                        this.$router.push({name: 'scrape-results', params: { card: this.card } });
                    })
                    .catch(error => console.log(error.response));
                }
            })
            .catch(error => console.log(error.response));
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