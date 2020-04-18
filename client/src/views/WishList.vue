<template>
    <div>
        <h1>Wish List</h1>
        <v-btn @click="getWishList()">Refresh List</v-btn>
        
        <div class="d-flex">
            <Search id="card-search" @selected_card="setCard"/>
            <v-select 
                :items="conditions" multiple chips deletable-chips outlined 
                menu-props="offsetY" label="Condition" class="pa-0" v-model="card.conditions"
            ></v-select>
            <v-text-field prefix="$" outlined label="Wish Price" v-model="card.wish_price"></v-text-field>
            <v-btn @click="addCard()" x-large :disabled="card.name == ''" color="success">Add Card</v-btn>
        </div>

        <ul v-if="wish_list.length">
            <li v-for="(card, index) in wish_list" :item="card" :key="index"><pre>{{card}}</pre></li>
        </ul>
        <p v-else>No cards in wish list...</p>
    </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import Search from '../components/Search'
import _ from 'lodash'

export default {
    name: 'WishList',
    components: {
        Search
    },
    data() {
        return {
            card: {
                multiverse_id: null,
                name: '',
                set_name: '',
                set_code: '',
                conditions: [],
                wish_price: null,
                image_uris: {}
            },
            conditions: ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'],
            wish_list: []
        }
    },
    created() {
        this.getWishList();
    },
    methods: {
        async getWishList() {
            await this.$http.get(`/users/${this.$store.state.user._id}/wish_list`)
            .then(response => {
                this.wish_list = response.data.wish_list;
            })
            .catch(error => console.log(error));
        },
        setCard(card) {
            this.card.multiverse_id = card.multiverse_id;
            this.card.name = card.name;
            this.card.set_name = card.set_name;
            this.card.set_code = card.set_code;
            this.card.image_uris = card.image_uris;

            console.log(this.card);
        },
        async addCard() {
            await this.$http.post(`/users/${this.$store.state.user._id}/wish_list`, this.card)
            .then(response => {
                console.log(response.data.message);

                this.getWishList();
                this.card = {
                    multiverse_id: null,
                    name: '',
                    set_name: '',
                    set_code: '',
                    conditions: [],
                    wish_price: null,
                    image_uris: {}
                };
            })
            .catch(error => console.log(error.response.data.message));
        }
    },
    watch: {
        'card.wish_price'() {
            console.log(this.card.wish_price)
        }
    }
}
</script>

<style lang="scss" scoped>
#card-search {
    width: 500px;
}
</style>