<template>
    <div>
        <h1>Home</h1>
        <button v-if="this.$store.state.logged_in" @click="logout()" type="submit">Logout</button>
        <p v-if="this.$store.state.logged_in">Hello {{ this.$store.state.user.email }}</p>

        <div>
            <input v-model="card_name" type="text" name="card_name" placeholder="Search for card..."/>
            <button type="submit">Search</button>
        </div>
        <p>Card being searched: {{card_name}}</p>
        <img v-for="(card, index) in queried_cards" :item="card" :key="index" :src="`${card.image_uris.small}`" alt="">
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    name: 'Home',
    data() {
        return {
            card_name: '',
            queried_cards: []
        }
    },
    methods: {
        delaySearch: _.debounce(function() { this.searchCards() }, 500),
        async searchCards() {
            await this.$http.get(`/cards?card_name=${this.card_name}`)
            .then(response => {
                this.queried_cards = response.data;
                console.log(response.data);
            })
            .catch(error => console.log(error));
        },
        async logout() {
            await this.$store.dispatch('logout')
            .then(response => {
                console.log(response.data.message);
            })
            .catch(error => console.log(error));
        }
    },
    watch: {
        card_name() {
            if(this.card_name.length > 2) {
                this.delaySearch();
            }
        }
    }
}
</script>

<style lang="scss" scoped>

</style>