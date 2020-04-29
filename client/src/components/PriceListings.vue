<template>
    <v-card>
        <v-tabs v-model="tab" background-color="amber accent-3" grow show-arrows>
            <v-tab v-for="(site, index) in websites" :item="site" :key="index" :href="'#site' + index">
                {{site.website}}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-tab-item v-for="(site, index) in websites" :item="site" :key="index" :value="'site' + index">
                <v-card>
                    <!-- <v-card-title><a :href="site.url" target="_blank">{{site.url}}</a></v-card-title> -->
                    <v-data-table
                        :headers="headers" 
                        :items="filtered_listings" 
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

export default {
    name: 'PriceListings',
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
            ]
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

                this.filterListings();
                this.calcDiff(card.wish_price);
            })
            .catch(error => {
                console.log(error);
            });
        },
        filterListings() {
            for(let website of this.websites) {
               this.filtered_listings = website.listings.filter(listing => {
                    return this.conditions.includes(listing.condition)
                })
            }
        },
        calcDiff(wish_price) {
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