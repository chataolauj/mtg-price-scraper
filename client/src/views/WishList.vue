<template>
    <div>
        <h1>Wish List</h1>
        <button @click="logout()" type="submit">Logout</button>
        <p>{{ this.$store.state.user.email }}'s wish list.</p>
        <button @click="getWishList()">Refresh List</button>
        
        <div>
            <Search />
            <!-- <input v-model="card.name" type="text" name="card_name" placeholder="Enter a card name..."> -->
            <select v-model="card.condition" name="condition">
                <option value="Any" selected>Any</option>
                <option value="Near Mint">Near Mint</option>
                <option value="Lightly Played">Lightly Played</option>
                <option value="Moderately Played">Moderately Played</option>
                <option value="Heavily Played">Heavily Played</option>
                <option value="Damaged">Damaged</option>
            </select>
            <input v-model="card.wish_price" type="number" name="wish_price" placeholder="Enter your wish price...">
            <input v-model="card.max_range" type="number" name="max_range" placeholder="Enter max range...">
            <button @click="addCard()">Add to Wish List</button>
        </div>

        <ul v-if="wish_list.length">
            <li v-for="(card, index) in wish_list" :item="card" :key="index"><pre>{{card}}</pre></li>
        </ul>
        <p v-else>No cards in wish list...</p>
    </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import Search from './Search'
import mtg from 'mtgsdk'
import _ from 'lodash'

export default {
    name: 'WishList',
    components: {
        Search
    },
    data() {
        return {
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
            wish_list: []
        }
    },
    created() {
        this.getWishList();
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
        async getWishList() {
            await this.$http.get(`/users/${this.$store.state.user._id}/wish_list`)
            .then(response => {
                this.wish_list = response.data.wish_list;
            })
            .catch(error => console.log(error));
        },
        async addCard() {
            await mtg.card.where({ name: this.card.name })
            .then(cards => {
                this.card.multiverse_id = cards[0].multiverseid;
                this.card.name = cards[0].name;
                this.card.set_code = cards[0].set;
            })
            .catch(error => console.log(error.response));

            await mtg.set.find(this.card.set_code).then(result => this.card.set_name = result.set.name);

            await this.$http.post(`/users/${this.$store.state.user._id}/wish_list`, this.card)
            .then(() => this.getWishList())
            .catch(error => console.log(error));
        },
        async logout() {
            await this.$store.dispatch('logout')
            .then(response => {
                this.$router.push('/');
                console.log(response.data.message);
            })
            .catch(error => console.log(error));
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

</style>