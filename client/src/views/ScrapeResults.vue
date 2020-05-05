<template>
    <v-row class="d-flex flex-column mx-0">
        <Snackbar :snack="snackbar"/>
        <v-col>
            <h1>Scrape Results</h1>
        </v-col>
        <v-col>
            <v-row>
                <v-col cols="4">
                    <v-img :src="card.image_uris.normal"></v-img> 
                </v-col>
                <v-col cols="8" class="d-flex flex-column">
                    <PriceListings :card="card"/>
                    <v-btn @click="addCard()" block color="success" :loading="isLoading" class="mt-4">Add to Wish List</v-btn>
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
    props: {
        card: Object
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
                multiverse_id: this.card.multiverse_id,
                name: this.card.name,
                set_name: this.card.set_name,
                set_code: this.card.set_code,
                conditions: [],
                wish_price: null,
                image_uris: this.card.image_uris,
                isFoil: false
            };
            
            await this.$http.post(`/users/${this.$store.state.user._id}/wish_list`, this.card_to_add)
            .then(async (response) => {
                let notify = {
                    email: this.$store.state.user.email,
                    wish_price: this.card_to_add.wish_price,
                    name: this.card_to_add.name,
                    set_name: this.card_to_add.set_name
                }

                await this.$http.post('/scrape-list/card/notify-list', notify);
                
                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }

                this.isLoading = false;
            })
            .catch(error => {
                console.log(error.response.data.message)

                this.snackbar = {
                    msg: error.response.data.message,
                    color: 'error',
                    close_color: 'white',
                    show: true
                }

                this.isLoading = false;
            });
        }
    },
    watch: {
        card() {
            console.log(this.card)
        }
    }
}
</script>

<style>

</style>