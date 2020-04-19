<template>
    <div>
        <h1>Wish List</h1>
        <v-btn @click="getWishList()">Refresh List</v-btn>

        <v-container fluid>
            <v-row>
                <div class="d-flex" style="width: 100%;">
                    <Search id="card-search" @selected_card="setCard" :cardAdded="clearSearch"/>
                    <v-select 
                        :items="conditions" multiple outlined 
                        menu-props="offsetY" label="Condition" v-model="card.conditions"
                    >
                    </v-select>
                    <v-text-field prefix="$" outlined label="Wish Price" v-model="card.wish_price"></v-text-field>
                    <v-btn @click="addCard()" x-large :disabled="card.name == ''" color="success">Add Card</v-btn>
                </div>
            </v-row>
            <v-row>
                <v-card class="my-2 mx-auto" style="width: 90%;" v-for="(card, index) in wish_list" :item="card" :key="index">
                    <v-container>
                        <v-row justify="space-around">
                            <v-col cols="auto">
                                <v-btn @click="deleteCard(card)" icon color="error">
                                    <v-icon>mdi-delete</v-icon>
                                </v-btn>
                                <v-img :src="card.image_uris.small"></v-img>
                            </v-col>
                            <v-col class="d-flex flex-column justify-space-around" cols="auto">
                                <v-card-text style="font-size: 1.2em" >Name: {{card.name}}</v-card-text>
                                <v-card-text style="font-size: 1.2em" >Set: {{card.set_name}}</v-card-text>
                                <v-card-text style="font-size: 1.2em" >Wish Price: ${{card.wish_price != null ? card.wish_price : 0.00}}</v-card-text>
                            </v-col>
                            <v-col cols="auto">

                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-row>
        </v-container>
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
            wish_list: [],
            clearSearch: false
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

                this.clearSearch = !this.clearSearch;
            })
            .catch(error => console.log(error.response.data.message));
        },
        async deleteCard(card) {
            await this.$http.delete(`/users/${this.$store.state.user._id}/wish_list?name=${card.name}&set_name=${card.set_name}`)
            .then(response => {
                console.log(response.data.message);

                this.getWishList();
            })
            .catch(error => console.log(error));
        }
    }
}
</script>

<style lang="scss" scoped>
#card-search {
    width: 450px;
}
</style>