<template>
    <v-row :class="[$vuetify.breakpoint.lgAndDown ? 'home-padding lgAndDown' : 'home-padding x-lg']" justify="center">
        <Snackbar :snack="snackbar"/>
        <v-col cols="12" class="pa-0 d-flex flex-column align-center">
            <v-img 
                src="../../public/images/yellow_logo.png" 
                class="mb-n4" 
                :height="$vuetify.breakpoint.xs ? '200' : '250'"
                :width="$vuetify.breakpoint.xs ? '200' : '250'"
            ></v-img>
        </v-col>
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
                this.isLoading = false;
                this.clearSearch = !this.clearSearch;

                if(error.response) {
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
}
</script>

<style lang="scss" scoped>
#search {
    width: 600px;
    margin: 0 auto;
}

.home-padding {
    &.lgAndDown {
        padding-top: 50px;
    }

    &.x-lg {
        padding-top: 100px;
    }
}
</style>