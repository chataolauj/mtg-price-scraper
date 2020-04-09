<template>
    <div>
        <h1>Home</h1>
        <button v-if="this.$store.state.logged_in" @click="logout()" type="submit">Logout</button>
        <p v-if="this.$store.state.logged_in">Hello {{ this.$store.state.user.email }}</p>

        <div>
            <input @keyup.enter="search_card()" v-model="card_name" type="text" name="card_name" placeholder="Search for card..."/>
            <button @click="search_card()" type="submit">Search</button>
        </div>
        <p>Card being searched: {{card_name}}</p>
        <img v-for="(card, index) in cards" :item="card" :key="index" :src="`${card.imageUrl}`" alt="">
    </div>
</template>

<script>
import mtg from 'mtgsdk'

export default {
    name: 'Home',
    data() {
        return {
            card_name: '',
            scrape_urls: [],
            cards: []
        }
    },
    methods: {
        search_card() {
            mtg.card.where({name: this.card_name})
            .then(cards => {
                this.cards = cards.filter(card => Object.prototype.hasOwnProperty.call(card, 'imageUrl'));
                console.log(this.cards);
            })
            .catch(error => {
                console.log(error);
            })
        },
        async logout() {
            await this.$store.dispatch('logout')
            .then(response => {
                console.log(response.data.message);
            })
            .catch(error => console.log(error));
        }
    }
}
</script>

<style lang="scss" scoped>

</style>