<template>
    <v-row class="d-flex flex-column mx-0">
        <Snackbar :snack="snackbar"/>
        <v-col cols="12" class="pb-0">
            <h1>Scrape Results</h1>
        </v-col>
        <v-col cols="12">
            <v-row class="d-flex flex-column flex-lg-row" align="center" align-lg="stretch">
                <v-col cols="12" sm="4"> <!-- Card Image -->
                    <v-img :src="$store.state.card.image_uris.normal" contain></v-img>

                    <v-btn 
                        v-if="this.$store.state.logged_in && $vuetify.breakpoint.mdAndDown" @click="addCard()" 
                        block color="success" :loading="isLoading"
                        class="mt-4"
                    >
                        Add to Wish List
                    </v-btn>
                </v-col>
                <v-col cols="12" sm="4" v-if="!this.$store.state.logged_in && $vuetify.breakpoint.mdAndDown" class="px-0 py-2">
                    <v-btn block disabled>Login to Add to Wish List</v-btn> 
                </v-col>
                <v-col cols="12" lg="8" class="d-flex flex-column"> <!-- Price Listings -->
                    <PriceListings :card="$store.state.card"/>

                    <v-btn 
                        v-if="this.$store.state.logged_in && $vuetify.breakpoint.lgAndUp" @click="addCard()" 
                        block color="success" :loading="isLoading"
                        class="mt-4"
                    >
                        Add to Wish List
                    </v-btn>
                    <v-btn 
                        v-else-if="!this.$store.state.logged_in && $vuetify.breakpoint.lgAndUp" 
                        disabled block class="mt-4"
                    >
                        Login to Add to Wish List
                    </v-btn> 
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>

<script>
import Snackbar from '../components/Snackbar'
import PriceListings from '../components/PriceListings'

export default {
    name: 'ScrapeResults',
    components: {
        Snackbar,
        PriceListings
    },
    data() {
        return {
            isLoading: false,
            card_to_add: {},
            snackbar: {}
        }
    },
    methods: {
        async addCard() {
            this.isLoading = true;
            
            this.card_to_add = {
                multiverse_id: this.$store.state.card.multiverse_id,
                name: this.$store.state.card.name,
                set_name: this.$store.state.card.set_name,
                set_code: this.$store.state.card.set_code,
                conditions: [],
                wish_price: null,
                image_uris: this.$store.state.card.image_uris
            };
            
            await this.$http.post(`/users/${this.$store.state.email}/wish_list`, this.card_to_add)
            .then(async (response) => {
                let notify = {
                    email: this.$store.state.email,
                    wish_price: this.card_to_add.wish_price,
                    name: this.card_to_add.name,
                    set_name: this.card_to_add.set_name
                }

                await this.$http.post(`/scrape-list/${this.card_to_add.set_name}/${this.card_to_add.name}/notify-list`, notify);
                
                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }

                this.isLoading = false;
            })
            .catch(error => {
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

<style>

</style>