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
                    <v-card-title><a :href="site.url" target="_blank">{{site.url}}</a></v-card-title>
                    <v-data-table
                        :headers="headers" 
                        :items="site.listings" 
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
export default {
    name: 'PriceListings',
    props: {
        card: Object
    },
    data() {
        return {
            tab: null,
            websites: [],
            conditions: ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'],
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
            .then(response => {
                this.websites = response.data.websites
            })
            .catch(error => {
                console.log(error.response);
            });
        }
    }
}
</script>

<style lang="scss" scoped>

</style>