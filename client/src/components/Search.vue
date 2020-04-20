<template>
    <div id="search">
        <v-menu offset-y transition="slide-y-transition" class="mt-n4">
            <template v-slot:activator="{ on: focus }">
                <v-text-field 
                    v-on="focus" hide-details
                    :rounded="isHomeRoute" outlined flat :shaped="isFocused && isHomeRoute && queried_cards.length > 0" label="Search for a card..."
                    v-model="card_name" @focus="isFocused = true" @blur="isFocused = false">
                </v-text-field>
            </template>
            <v-list class="pa-0 overflow-y-auto" max-height="300" two-line>
                <v-list-item @click="setCard(card)" v-for="(card, index) in queried_cards" :item="card" :key="index">
                    <v-list-item-content>
                        <v-list-item-title class="mb-2">{{card.name}}</v-list-item-title>
                        <v-list-item-subtitle>{{card.set_name}}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    name: 'Search',
    props: {
        cardAdded: Boolean
    },
    data() {
        return {
            isHomeRoute: true,
            isFocused: false,
            queried_cards: [],
            card_name: ''
        }
    },
    mounted() {
        if(this.$router.currentRoute.name != 'home') {
            this.isHomeRoute = false;
        }
    },
    methods: {
        delaySearch: _.debounce(function() { this.searchCards() }, 500),
        async searchCards() {
            await this.$http.get(`/cards?card_name=${this.card_name}`)
            .then(response => {
                console.log(response.data)
                this.queried_cards = response.data;
            })
            .catch(error => console.log(error));
        },
        setCard(card) {
            this.$emit('selected_card', card);
            this.card_name = `${card.name} - ${card.set_name}`;
            this.queried_cards = [];
        }
    },
    watch: {
        card_name() {
            if(this.card_name.length > 2) {
                this.delaySearch();
            }
            else {
                this.queried_cards = [];
            }
        },
        cardAdded() {
            this.card_name = '';
        }
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}

#search {

}
</style>