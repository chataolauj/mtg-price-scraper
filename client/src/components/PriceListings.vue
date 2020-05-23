<template>
    <v-card>
        <Snackbar :snack="snackbar"/>
        <!-- <v-btn v-if="this.$router.currentRoute.name == 'wish-list'" @click="scrape()" block :loading="isLoading">Update Listings</v-btn> -->
        <v-tabs v-model="tab" background-color="amber accent-3" grow show-arrows>
            <v-tab v-for="(website, index) in websites" :item="website" :key="index" :href="'#site' + index">
                {{website.name}}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-tab-item v-for="(website, index) in websites" :item="website" :key="index" :value="'site' + index">
                <v-card>
                    <v-card-text class="d-block text-truncate pb-0">Link: <a :href="website.url" target="_blank">{{website.url}}</a></v-card-text> <!-- Link -->
                    <v-row align="center"> <!-- Last Update -->
                        <v-col cols="auto" class="py-0 pr-0">
                            <v-card-text class="pr-1 pb-3">Last update: {{website.scrapedAt | formatDate}}</v-card-text>
                        </v-col>
                        <v-col class="pa-0">
                            <v-btn v-if="$router.currentRoute.name == 'wish-list'" @click="scrape()" icon small :loading="isLoading">
                                <v-icon>mdi-refresh</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    
                    <v-data-table
                        :headers="headers" 
                        :items="$router.currentRoute.name == 'wish-list' ? filtered_listings : website.listings" 
                        :items-per-page="5"
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
                    value: 'price'
                },
                {
                    text: 'Shipping (USD)',
                    value: 'shipping'
                },
                {
                    text: 'Total (price + shipping)',
                    value: 'total_price'
                },
                {
                    text: '(%) Diff. From Price',
                    value: 'percent_diff'
                },
            ],
            snackbar: {},
            isLoading: false
        }
    },
    created() {
        this.getCardWebsites();
    },
    filters: {
        formatDate(scrapedAt) {
            let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
            let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let date = new Date(scrapedAt);

            let day = date.getDay();
            let mm = date.getMonth();
            let dd = date.getDate();
            let year = date.getFullYear();
            let hour = date.getHours();
            let minutes = date.getMinutes();
            let timezone = date.toLocaleString('en', {timeZoneName:'short'}).split(' ').pop();

            return days[day] + ', ' + months[mm] + ' ' + dd + ', ' + year 
                    + ' at ' + (hour > 12 ? hour - 12 : hour)
                    + ':'  + (minutes < 10 ? '0' + minutes : minutes)
                    + (hour < 12 ? ' a.m.' : ' p.m.')
                    + ' ' + timezone;
        }
    },
    methods: {
        async getCardWebsites() {
            await this.$http.get(`/scrape-list/${this.card.set_name}/${this.card.name}/websites`)
            .then(async response => {
                this.websites = response.data;

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

            await this.$http.patch(`/scrape-list/${this.card.set_name}/${this.card.name}/websites`)
            .then(async (response) => {
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
                    let price_diff = (listing.price - wish_price).toFixed(2);
                    let percent_diff = (((listing.price - wish_price) / wish_price) * 100).toFixed(2);

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
            this.getCardWebsites();
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