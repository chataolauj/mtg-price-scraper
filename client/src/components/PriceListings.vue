<template>
    <v-card>
        <Snackbar :snack="snackbar"/>
        <!-- <v-btn v-if="this.$router.currentRoute.name == 'wish-list'" @click="scrape()" block :loading="isLoading">Update Listings</v-btn> -->
        <v-tabs v-model="tab" background-color="amber accent-3" grow show-arrows>
            <v-tab v-for="(site, index) in websites" :item="site" :key="index" :href="'#site' + index">
                {{site.website}}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-tab-item v-for="(site, index) in websites" :item="site" :key="index" :value="'site' + index">
                <v-card>
                    <v-card-text class="d-block text-truncate pb-0">Link: <a :href="site.url" target="_blank">{{site.url}}</a></v-card-text>
                    <v-row align="center">
                        <v-col cols="auto" class="py-0 pr-0">
                            <v-card-text class="pr-1 pb-3">Last update: {{site.createdAt}}</v-card-text>
                        </v-col>
                        <v-col class="pa-0">
                            <v-btn v-if="$router.currentRoute.name == 'wish-list'" @click="scrape()" icon small :loading="isLoading">
                                <v-icon>mdi-refresh</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    
                    <v-data-table
                        :headers="headers" 
                        :items="$router.currentRoute.name == 'wish-list' ? filtered_listings : site.listings" 
                        :items-per-page="5" 
                        :sort-by="['usd', 'qty']"
                        :sort-desc="[false, true]"
                        multi-sort
                    ></v-data-table>
                </v-card>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script>
/* eslint-disable no-unused-vars */
import Snackbar from '../components/Snackbar'

export default {
    name: 'PriceListings',
    components: {
        Snackbar
    },
    props: {
        card: Object,
        conditions: Array,
        user_price: Number
    },
    data() {
        return {
            tab: null,
            websites: [],
            filtered_listings: [],
            headers: [
                {
                    text: 'Qty.',
                    align: 'start',
                    sortable: true,
                    value: 'qty'
                },
                {
                    text: 'Condition',
                    value: 'condition'
                },
                {
                    text: 'Price (USD)',
                    value: 'usd'
                },
                {
                    text: 'Shipping (USD)',
                    value: 'shipping'
                },
                {
                    text: '(%) Diff.',
                    value: 'percent_diff'
                },
            ],
            snackbar: {},
            isLoading: false,
        }
    },
    created() {
        this.getCardWebsites(this.card);
    },
    methods: {
        async getCardWebsites(card) {
            await this.$http.get(`/scrape-list/card/websites?name=${card.name}&set_name=${card.set_name}`)
            .then(async response => {
                this.websites = response.data.websites;

                if(this.conditions) {
                    this.filterListings();
                }
                else {
                    for(let website of this.websites) {
                        website.listings.map(listing => {
                            this.$set(listing, 'percent_diff', 'N/A');
                        })
                    }
                }
            })
            .catch(error => {
                console.log(error);
            });
        },
        async scrape() {
            this.isLoading = true;

            await this.$http.put('/scrape-list/card', this.card)
            .then(async (response) => {
                await this.getCardWebsites(this.card);

                this.isLoading = false;

                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
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
        },
        filterListings() {
            for(let website of this.websites) {
               this.filtered_listings = website.listings.filter(listing => {
                    return this.conditions.includes(listing.condition)
                })
            }

            this.calcDiff(this.user_price);
        },
        calcDiff(wish_price) {
            if(wish_price > 0) {
                for(let listing of this.filtered_listings) {
                    let price_diff = (listing.usd - wish_price).toFixed(2);
                    let percent_diff = (((listing.usd - wish_price) / wish_price) * 100).toFixed(2);

                    if(price_diff > 0) {
                        this.$set(listing, 'percent_diff', "$" + price_diff + " or " + percent_diff + "% more");
                    }
                    else {
                        this.$set(listing, 'percent_diff', "$" + Math.abs(price_diff) + " or " + Math.abs(percent_diff) + "% less");
                    }
                }
            }
            else {
                for(let website of this.websites) {
                    website.listings.map(listing => {
                        this.$set(listing, 'percent_diff', 'N/A');
                    })
                }
            }
        }
    },
    watch: {
        card() {
            this.getCardWebsites(this.card);
        },
        user_price() {
            this.calcDiff(this.user_price);
        },
        conditions() {
            this.filterListings();
        }
    }
}
</script>

<style lang="scss" scoped>

</style>