<template>
    <div>
        <div id="search">
            <input v-model="card.name" @focus="isFocused = true" @blur="isFocused = false" type="text" name="card_name" placeholder="Enter a card name...">
            <ul v-if="queried_cards.length && isFocused">
                <li @click="setCardName(card)" v-for="(card, index) in queried_cards" :item="card" :key="index">{{card.name}} <br> <i>{{card.set_name}}</i></li>
            </ul>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    name: 'Search',
    data() {
        return {
            isFocused: false,
            queried_cards: [],
            card: {
                multiverse_id: null,
                name: '',
                set_name: '',
                set_code: '',
                condition: '',
                wish_price: null,
                max_range: null,
                image_uris: {}
            },
        }
    },
    methods: {
        delaySearch: _.debounce(function() { this.searchCards() }, 500),
        async searchCards() {
            await this.$http.get(`/cards?card_name=${this.card.name}`)
            .then(response => {
                this.queried_cards = response.data;
                console.log(response.data);
            })
            .catch(error => console.log(error));
        },
        setCardName(card) {
            this.card.name = card.name;
        }
    },
    watch: {
        'card.name'() {
            if(this.card.name.length > 2) {
                this.delaySearch();
            }
        }
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}
#search {
    width: 50%;
    margin: auto;
    display: block;

    input[type=text] {
        font-size: 1em;
        width: 100%;
        padding: 10px 0px 10px 10px;
    }

    ul {
        width: 100%;
        padding: 0;
        margin-top: 3px;
        border: 1px solid grey;

        li {
            padding: 5px 0px 5px 10px;;
            list-style: none;
            border-bottom: 1px solid grey;
        }

        li:last-child {
            border-bottom: none;
        }
    }
}
</style>