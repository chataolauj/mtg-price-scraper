<template>
    <v-card>
        <v-tabs v-model="tab" background-color="amber accent-3" show-arrows>
            <v-tab v-for="(site, index) in websites" :item="site" :key="index" :href="'#site' + index">
                {{site.name}}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-tab-item v-for="(site, index) in websites" :item="site" :key="index" :value="'site' + index">
                <v-card>
                    <v-card-title>Link: <a :href="site.url"> {{site.url}}</a></v-card-title>
                    <v-data-table
                        :headers="headers"
                        :items="site.listing"
                        :items-per-page="5"
                    ></v-data-table>
                </v-card>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script>
export default {
    name: 'PriceListings',
    data() {
        return {
            tab: null,
            websites: [],
            conditions: ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'],
            headers: [
                {
                    text: 'Quantity',
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
                    text: 'Percent Difference (%)',
                    value: 'percent_diff'
                },
            ]
        }
    },
    created() {
        this.generateData();
    },
    methods: {
        generateData() {
            for(let i = 0; i < 15; i++) {
                this.websites.push({
                    name: `site${i}`,
                    url: `tcgplayer.com`,
                    listing: []
                });

                for(let j = 0; j < 15; j++) {
                    this.websites[i].listing.push({
                        qty: Math.floor(Math.random() * 4) + 1,
                        condition: this.conditions[Math.floor(Math.random() * 5)],
                        price: +(Math.random() * Math.floor(100)).toFixed(2),
                        percent_diff: +(Math.random() * 100).toFixed(2)
                    });
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>

</style>