<template>
    <div>
        <v-snackbar v-model="showSnack" top :color="snackbar.color" :timeout="5000">
          {{snackbar.msg}}
          <v-btn small icon :color="snackbar.close_color" class="pa-0 pr-2 no-outline" @click="showSnack = false">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </v-snackbar>

        <v-container style="width: 80%" fluid>
            <v-row class="d-flex justify-center align-center mb-2">
                <h1 class="mr-2">Wish List</h1>
                <v-btn @click="getWishList()" icon color="success">
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
            </v-row>
            <v-row>
                <v-toolbar :tile="false" dark color="blue darken-3" height="90px" class="mb-4">
                    <Search style="width: 450px" @selected_card="setCard" :cardAdded="clearSearch"/>
                    <v-spacer></v-spacer>

                    <v-select 
                        
                        :items="conditions" multiple outlined hide-details
                        menu-props="offsetY" label="Condition" v-model="card.conditions"
                    >
                    </v-select>
                    <v-spacer></v-spacer>

                    <v-text-field  prefix="$" outlined hide-details label="Wish Price" v-model="card.wish_price"></v-text-field>
                    <v-spacer></v-spacer>

                    <v-btn @click="addCard()" style="height: 56px" x-large :disabled="card.name == ''" color="success">Add Card</v-btn>
                </v-toolbar>
            </v-row>
            <div class="d-flex justify-center" v-if="!wish_list.length">
                <h2>No cards in your wish list...</h2>
            </div>
            <v-row>
                <v-card class="my-2 mx-auto" style="width: 100%;" v-for="(card, index) in wish_list" :item="card" :key="index">
                    <v-container fluid>
                        <v-row justify="space-around">
                            <v-col cols="6">
                                <v-row>
                                    <v-col cols="auto" class="d-flex flex-column justify-center align-center">
                                        <v-checkbox class="ma-0"></v-checkbox>
                                        <v-btn icon color="success">
                                            <v-icon>mdi-pencil</v-icon>
                                        </v-btn>
                                        <v-dialog v-model="deleteDialog[card._id]" max-width="25%">
                                            <template v-slot:activator="{ on }">
                                                <v-btn v-on="on" icon color="error">
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
                                    </v-col>
                                    <v-col cols="auto" class="d-flex flex-column">
                                        <v-img :src="card.image_uris.small"></v-img>
                                        <v-col cols="auto" class="d-flex justify-center align-center">
                                            <v-btn icon color="success">
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-dialog v-model="deleteDialog[card._id]" max-width="25%">
                                                <template v-slot:activator="{ on }">
                                                    <v-btn v-on="on" icon color="error">
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
                                        </v-col>
                                    </v-col>
                                    <v-col class="d-flex flex-column justify-space-between" cols="auto">
                                        <v-card-text class="body-1 pa-0">Name: {{card.name}}</v-card-text>
                                        <v-card-text class="body-1 pa-0">Set: {{card.set_name}}</v-card-text>
                                        <v-card-text class="body-1 pa-0">Wish Price: ${{card.wish_price.toFixed(2)}}</v-card-text>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col cols="6">
                                Prices will go here...
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
            clearSearch: false,
            showSnack: false,
            snackbar: {
                msg: '',
                color: '',
                close_color: ''
            },
            deleteDialog: {}
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

                this.snackbar.msg = response.data.message;
                this.snackbar.color = 'success';
                this.snackbar.close_color = 'error';
                this.showSnack = true;
                
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
            .catch(error => {
                console.log(error.response.data.message)

                this.snackbar.msg = error.response.data.message;
                this.snackbar.color = 'error';
                this.snackbar.close_color = 'white';
                this.showSnack = true;
            });
        },
        async deleteCard(card) {
            await this.$http.delete(`/users/${this.$store.state.user._id}/wish_list/card/${card._id}`)
            .then(response => {
                console.log(response.data.message);

                delete this.deleteDialog[card._id];

                this.getWishList();

                this.snackbar.msg = response.data.message;
                this.snackbar.color = 'success';
                this.snackbar.close_color = 'error';
                this.showSnack = true;
            })
            .catch(error => {
                console.log(error.response)

                this.snackbar.msg = error.response.data.message;
                this.snackbar.color = 'error';
                this.snackbar.close_color = 'white';
                this.showSnack = true;
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