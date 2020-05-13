<template>
    <v-row justify="center" class="d-flex flex-column mx-0">
        <Snackbar :snack="snackbar"/>
        <v-col cols="12" class="d-flex justify-center align-center"> <!-- Header -->
            <h1 class="mr-2">Wish List</h1>
            <v-btn @click="getWishList()" :loading="refresh" icon color="">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </v-col>
        <v-col cols="12"> <!-- Toolbar -->
            <v-toolbar :tile="false" dark color="blue darken-3" height="90px">
                <Search style="width: 450px" @selected_card="setCard" :cardAdded="clearSearch"/>
                <v-spacer></v-spacer>

                <v-select 
                    :items="conditions" multiple outlined hide-details
                    menu-props="offsetY" label="Condition" v-model="card_to_add.conditions"
                >
                </v-select>
                <v-spacer></v-spacer>

                <v-text-field prefix="$" outlined hide-details label="Wish Price" v-model="card_to_add.wish_price"></v-text-field>
                <v-spacer></v-spacer>

                <v-btn @click="addCard()" style="height: 56px" x-large :loading="isLoading" :disabled="card_to_add.name == ''" color="success">Add Card</v-btn>
            </v-toolbar>
        </v-col>
        <div class="d-flex justify-center" v-if="!wish_list.length">
            <h2>No cards in your wish list...</h2>
        </div>
        <v-col> <!-- Wish List -->
            <v-card class="mb-6" style="width: 100%;" v-for="(card, index) in wish_list" :item="card" :key="index">
                <v-container fluid>
                    <v-row justify="space-around">
                        <!-- <v-col cols="1" class="d-flex flex-column justify-center align-center">
                            <v-checkbox class="ma-0"></v-checkbox>
                        </v-col> -->
                        <v-col cols="6"> <!-- Card Details -->
                            <v-row>
                                <!-- <v-col cols="auto" class="d-flex flex-column justify-center align-center">
                                    <v-checkbox class="ma-0"></v-checkbox>
                                </v-col> -->
                                <v-col cols="6" class="d-flex flex-column align-center"> 
                                    <v-img :src="card.image_uris.normal" contain></v-img> 
                                    <div class="d-flex justify-center align-center"> <!--  Card action buttons -->
                                        <v-dialog v-model="deleteDialog[card._id]" max-width="25%"> <!-- Delete Dialog -->
                                            <template v-slot:activator="{ on: remove }">
                                                <v-btn v-on="remove" icon color="error">
                                                    <v-icon>mdi-delete</v-icon>
                                                </v-btn>
                                            </template>
                                            <v-card>
                                                <v-card-title class="headline">Remove from wish list?</v-card-title>
                                                <v-card-text>Are you sure you want to remove {{card.name}} ({{card.set_name}}) from your wish list?</v-card-text>
                                                <v-card-actions>
                                                    <v-spacer></v-spacer>
                                                    <v-btn text @click="deleteDialog[card._id] = false">Cancel</v-btn>
                                                    <v-btn color="error" text @click="deleteCard(card)">Remove</v-btn>
                                                </v-card-actions>
                                            </v-card>
                                        </v-dialog>
                                        <v-btn v-show="!editCard[card._id]" @click="$set(editCard, card._id, true)" icon color="success">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-btn v-show="editCard[card._id]" @click="saveEdit(card)" icon color="success">
                                            <v-icon>mdi-floppy</v-icon>
                                        </v-btn>
                                    </div>
                                </v-col>
                                <v-col class="d-flex flex-column" cols="6"> <!-- Wish Price & Conditions -->
                                    <v-card-title class="pa-0 font-weight-bold d-inline-block text-truncate">{{card.name}}</v-card-title>
                                    <v-card-subtitle class="pa-0 ma-0 mb-2 font-weight-light d-inline-block text-truncate">{{card.set_name}}</v-card-subtitle>
                                    <div v-if="!editCard[card._id]">
                                        <v-card-text class="pa-0 mb-2 body-1">Foil: {{card.isFoil ? 'Yes' : 'No'}}</v-card-text>
                                        <v-card-text class="pa-0 mb-2 body-1">Wish Price: ${{card.wish_price}}</v-card-text>
                                        <v-card-text class="pa-0 body-1">Condition(s):</v-card-text>
                                        <v-chip-group column>
                                            <v-chip 
                                                color="amber accent-3" :ripple="false"
                                                v-for="(condition, index) in card.conditions" :item="condition" :key="index"
                                            >
                                                {{condition}}
                                            </v-chip>
                                        </v-chip-group>
                                    </div>
                                    <div v-else> <!-- Editable details -->
                                        <v-card-text>Foil: </v-card-text><v-switch v-model="card.isFoil" :label="card.isFoil ? 'Yes' : 'No'"></v-switch>
                                        <v-text-field class="mb-2" prefix="$" solo hide-details label="Wish Price" v-model="card.wish_price"></v-text-field>
                                        <v-select 
                                            :items="conditions" multiple solo hide-details
                                            menu-props="offsetY" label="Condition" v-model="card.conditions"
                                        >
                                        </v-select>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="6"> <!-- Price Listings -->
                            <PriceListings :card="card" :conditions="card.conditions" :user_price="+card.wish_price"/>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
/* eslint-disable no-unused-vars */
import Snackbar from '../components/Snackbar'
import Search from '../components/Search'
import PriceListings from '../components/PriceListings'

import _ from 'lodash'

export default {
    name: 'WishList',
    components: {
        Snackbar,
        Search,
        PriceListings
    },
    data() {
        return {
            card_to_add: {
                multiverse_id: null,
                name: '',
                set_name: '',
                set_code: '',
                conditions: [],
                wish_price: null,
                image_uris: {},
                isFoil: null
            },
            conditions: ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'],
            wish_list: [],
            clearSearch: false,
            snackbar: {},
            deleteDialog: {},
            editCard: {},
            isLoading: false,
            refresh: false
        }
    },
    created() {
        this.getWishList();
    },
    methods: {
        async getWishList() {
            this.refresh = true;

            await this.$http.get(`/users/${this.$store.state.user._id}/wish_list`)
            .then(response => {
                this.wish_list = response.data.wish_list;

                this.refresh = false;

                if(this.wish_list.length > 0) {
                    this.edit = {};

                    for(let i = 0; i < this.wish_list.length; i++) {
                        this.$set(this.edit, this.wish_list[i]._id, false);
                    }
                }
            })
            .catch(error => {
                console.log(error)

                this.refresh = false;
            });
        },
        setCard(card) {
            this.card_to_add.multiverse_id = card.multiverse_id;
            this.card_to_add.name = card.name;
            this.card_to_add.set_name = card.set_name;
            this.card_to_add.set_code = card.set_code;
            this.card_to_add.image_uris = card.image_uris;
        },
        async addCard() {
            this.isLoading = true;
            
            await this.$http.post(`/users/${this.$store.state.user._id}/wish_list`, this.card_to_add)
            .then(async (response) => {
                await this.$http.post('/scrape-list', this.card_to_add);

                let notify = {
                    email: this.$store.state.user.email,
                    wish_price: this.card_to_add.wish_price,
                    name: this.card_to_add.name,
                    set_name: this.card_to_add.set_name
                }

                await this.$http.post('/scrape-list/card/notify-list', notify);

                this.getWishList();

                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }

                this.isLoading = false;
                
                //find a better way of doing this
                this.card_to_add = {
                    multiverse_id: null,
                    name: '',
                    set_name: '',
                    set_code: '',
                    conditions: [],
                    wish_price: null,
                    image_uris: {},
                    isFoil: false
                };

                this.clearSearch = !this.clearSearch;
            })
            .catch(error => {
                console.log(error.response.data.message)

                this.snackbar = {
                    msg: error.response.data.message,
                    color: 'error',
                    close_color: 'white',
                    show: true
                }
            });
        },
        async saveEdit(card) {
            this.$set(this.editCard, card._id, false);

            await this.$http.patch(`/users/${this.$store.state.user._id}/wish_list/card/${card._id}`, card)
            .then(async (response) => {

                let notify = {
                    email: this.$store.state.user.email,
                    wish_price: card.wish_price,
                    name: card.name,
                    set_name: card.set_name
                }

                await this.$http.patch('/scrape-list/card/notify-list', notify);

                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }
            })
            .catch(error => {
                console.log(error.response.data.message)

                this.snackbar = {
                    msg: error.response.data.message,
                    color: 'error',
                    close_color: 'white',
                    show: true
                }
            });
        },
        async deleteCard(card) {
            await this.$http.delete(`/users/${this.$store.state.user._id}/wish_list/card/${card._id}`)
            .then(async (response) => {
                delete this.deleteDialog[card._id];

                let notify = {
                    email: this.$store.state.user.email,
                    name: card.name,
                    set_name: card.set_name
                }

                await this.$http.delete(`/scrape-list/card/notify-list?email=${this.$store.state.user.email}&card_name=${card.name}&set_name=${card.set_name}`);

                this.getWishList();

                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }
            })
            .catch(error => {
                console.log(error.response)

                this.snackbar = {
                    msg: error.response.data.message,
                    color: 'error',
                    close_color: 'white',
                    show: true
                }
            });
        }
    }
}
</script>

<style lang="scss" scoped>

#card-search {
    width: 450px;
}
</style>