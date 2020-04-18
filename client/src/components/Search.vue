<template>
    <div>
        <div id="search">
            <v-text-field 
                :rounded="isHomeRoute" solo outlined flat :shaped="isFocused && isHomeRoute && queried_cards.length > 0" label="Search for a card..."
                v-model="card_name" @focus="isFocused = true" @blur="isFocused = false">
            </v-text-field>
            <v-list id="v-list" class="pa-0 overflow-y-auto" max-height="300" two-line v-show="queried_cards.length">
                <v-list-item @click="setCard(card)" v-for="(card, index) in queried_cards" :item="card" :key="index">
                    <v-list-item-content>
                        <v-list-item-title class="mb-2">{{card.name}}</v-list-item-title>
                        <v-list-item-subtitle class=".font-italic font-weight-light" >{{card.set_name}}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </div>
        <!-- <div id="search">
            <input v-model="card.name" @focus="isFocused = true" @blur="isFocused = false" type="text" name="card_name" placeholder="Enter a card name...">
            <ul v-if="queried_cards.length && isFocused">
                <li @click="setCardName(card)" v-for="(card, index) in queried_cards" :item="card" :key="index">{{card.name}} <br> <i>{{card.set_name}}</i></li>
            </ul>
        </div> -->
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    name: 'Search',
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
                this.queried_cards = response.data;
            })
            .catch(error => console.log(error));
        },
        setCard(card) {
            this.$emit('selected_card', card);
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
        }
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}

#v-list {
    margin-top: -30px;
    border: 2px solid rgba(0, 0, 0, 0.3);
    //border-radius: 0px 0px 17px 17px;
    //box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, .3);
}

#search {
    input[type=text] {
        font-size: 1em;
        width: 100%;
        padding: 15px 0px 15px 15px;
        border: 1px solid rgba(0, 0, 0, .3);
        border-radius: 50px;
        outline: none;

        &:hover {
            transition: .2s ease-in-out;
            box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, .3);
        }

        &:focus {
            transition: .2s ease-in-out;
            //border-radius: 25px 25px 0px 0px;
            box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, .3);
        }
    }

    ul {
        max-height: 296px;
        width: 100%;
        overflow: hidden;
        overflow-y: auto;
        padding: 0;
        margin: 2px auto;
        border: 1px solid rgba(0, 0, 0, .3);
        border-radius: 0px 0px 25px 25px;
        box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, .3);

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