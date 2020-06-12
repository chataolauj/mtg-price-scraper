<template>
    <v-row justify="center" class="d-flex flex-column mx-0">
        <Snackbar :snack="snackbar"/>
        <v-col cols="12" class="d-flex justify-center align-center"> <!-- Header -->
            <h1 class="mr-2">Wish List</h1>
            <v-btn @click="getWishList()" :loading="refresh" icon color="">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </v-col>
        <v-col v-if="$vuetify.breakpoint.smAndUp" cols="12" style="z-index: 1;"> <!-- Toolbar -->
            <div id="toolbar" class="pa-5 d-flex flex-column flex-sm-row">
                <Search 
                    class="mr-sm-3"
                    :style="$vuetify.breakpoint.sm ? 'width: 350px' : 'width: 400px'" 
                    @selected_card="setCard" @unset_card="unsetCard" :cardAdded="clearSearch"
                />

                <v-select 
                    v-model="card_to_add.conditions" dark class="mr-sm-3"
                    :items="conditions" multiple outlined single-line hide-details
                    menu-props="offsetY" label="Condition"
                >
                </v-select>

                <v-text-field 
                    v-model="card_to_add.wish_price" prefix="$" dark class="mr-sm-3"
                    outlined single-line hide-details label="Wish Price"
                ></v-text-field>

                <v-btn 
                    @click="addCard()" style="height: 56px" color="success" dark 
                    x-large :loading="isLoading" :disabled="card_to_add.name == ''"
                >
                    Add Card
                </v-btn>
            </div>
        </v-col>
        <v-dialog v-else v-model="showAdd" persistent> <!-- Add Card FAB -->
            <template v-slot:activator="{ on }">
                    <v-btn 
                        v-on="on" @click="showAdd = !showAdd" 
                        style="z-index: 1000;"
                        large :color="showAdd ? 'error' : 'success'" fab 
                        fixed bottom right dark
                    >
                        <v-icon>{{showAdd ? 'mdi-close' : 'mdi-plus'}}</v-icon>
                    </v-btn>
            </template>

            <v-card>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <Search @selected_card="setCard" @unset_card="unsetCard" :cardAdded="clearSearch" />
                        </v-col>
                        <v-col cols="12">
                            <v-select ref="select"
                                v-model="card_to_add.conditions" 
                                :items="conditions" multiple outlined single-line hide-details
                                menu-props="offsetY" label="Condition"
                            >
                            </v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field 
                                v-model="card_to_add.wish_price" prefix="$" 
                                outlined single-line hide-details label="Wish Price"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-btn 
                                @click="addCard()" color="success" block
                                x-large :loading="isLoading" :disabled="card_to_add.name == ''"
                            >
                                Add Card
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-dialog>
        <div class="d-flex justify-center" v-if="!wish_list.length">
            <h2>No cards in your wish list...</h2>
        </div>
        <v-col> <!-- Wish List -->
            <transition-group name="list">
                <v-card class="mb-6" style="width: 100%;" v-for="(card) in wish_list" :item="card" :key="card._id">
                    <v-container fluid>
                        <v-row justify="space-around">
                            <!-- <v-col cols="1" class="d-flex flex-column justify-center align-center">
                                <v-checkbox class="ma-0"></v-checkbox>
                            </v-col> -->
                            <v-col cols="12" lg="6"> <!-- Card Details -->
                                <v-row>
                                    <!-- <v-col cols="auto" class="d-flex flex-column justify-center align-center">
                                        <v-checkbox class="ma-0"></v-checkbox>
                                    </v-col> -->
                                    <v-col cols="12" sm="6" class="d-flex flex-column align-center"> 
                                        <v-img :src="$vuetify.breakpoint.mdAndDown ? card.image_uris.small : card.image_uris.normal" contain></v-img> 
                                        <div class="d-flex justify-center align-center"> <!-- Card action buttons -->
                                            <v-dialog 
                                                v-model="deleteDialog[card._id]" 
                                                :max-width="$vuetify.breakpoint.xsOnly ? '100%' : $vuetify.breakpoint.sm ? '50%' : $vuetify.breakpoint.md ? '35%' : '25%'"
                                            > <!-- Delete Dialog -->
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
                                            <v-btn v-show="!editCard[card._id]" @click="$set(editCard, card._id, true)" icon color="success"> <!-- Edit Details -->
                                                <v-icon>mdi-pencil</v-icon>
                                            </v-btn>
                                            <v-btn v-show="editCard[card._id]" @click="saveEdit(card)" icon color="success"> <!-- Save Edit -->
                                                <v-icon>mdi-floppy</v-icon>
                                            </v-btn>
                                        </div>
                                    </v-col>
                                    <v-col class="d-flex flex-column" cols="12" sm="6"> <!-- Wish Price & Conditions -->
                                        <v-card-title class="pa-0 font-weight-bold d-inline-block text-truncate">{{card.name}}</v-card-title>
                                        <v-card-subtitle class="pa-0 ma-0 mb-2 font-weight-light d-inline-block text-truncate">{{card.set_name}}</v-card-subtitle>
                                        <div v-if="!editCard[card._id]">
                                            <v-card-text class="pa-0 mb-2 body-1">Foil: {{card.isFoil ? 'Yes' : 'No'}}</v-card-text>
                                            <v-card-text class="pa-0 mb-2 body-1">Wish Price: ${{(+card.wish_price).toFixed(2)}}</v-card-text>
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
                                            <v-row align="center">
                                                <v-col cols="auto" class="pa-0">
                                                    <v-card-text>Foil: </v-card-text>
                                                </v-col>
                                                <v-col cols="auto" class="pa-0">
                                                    <v-switch v-model="card.isFoil" :label="card.isFoil ? 'Yes' : 'No'"></v-switch>
                                                </v-col>
                                            </v-row>
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
                            <v-col v-if="$vuetify.breakpoint.lgAndUp" cols="12" lg="6"> <!-- Price Listings -->
                                <PriceListings :card="card" :conditions="card.conditions" :user_price="+card.wish_price"/>
                            </v-col>
                            <v-card-actions v-else> <!-- Expand Button -->
                                <v-btn icon color="black" @click="$set(showListings, card._id, !showListings[card._id])">
                                    <v-icon>{{ showListings[card._id] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                                </v-btn>
                            </v-card-actions>

                            <v-expand-transition> <!-- Responsive Price Listings -->
                                <v-col v-show="showListings[card._id]" cols="12">
                                    <PriceListings :card="card" :conditions="card.conditions" :user_price="+card.wish_price"/>
                                </v-col>
                            </v-expand-transition>
                        </v-row>
                    </v-container>
                </v-card>
            </transition-group>
        </v-col>

        <v-fab-transition> <!-- To Top FAB -->
            <v-btn 
                v-show="showFAB" @click="toTop" 
                :style="$vuetify.breakpoint.xsOnly ? 'margin-bottom: 85px;' : ''"
                large color="blue darken-3" fab 
                fixed bottom right dark
            >
                <v-icon>mdi-chevron-up</v-icon>
            </v-btn>
        </v-fab-transition>

        
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
                image_uris: {}
            },
            conditions: ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'],
            wish_list: [],
            clearSearch: false,
            snackbar: {},
            deleteDialog: {},
            editCard: {},
            isLoading: false,
            refresh: false,
            showListings: {},
            showFAB: false,
            showAdd: false
        }
    },
    created() {
        window.addEventListener('scroll', this.onScroll);

        this.getWishList();
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.onScroll);
    },
    methods: {
        onScroll() {
            this.showFAB = window.scrollY > 250;
        },
        async getWishList() {
            this.refresh = true;

            await this.$http.get(`/users/${this.$store.state.user._id}/wish_list`)
            .then(response => {
                this.wish_list = response.data;

                this.refresh = false;
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
        unsetCard() {
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

                await this.$http.post(`/scrape-list/${this.card_to_add.set_name}/${this.card_to_add.name}/notify-list`, notify);

                await this.getWishList();

                this.snackbar = {
                    msg: response.data.message,
                    color: 'success',
                    close_color: 'white',
                    show: true
                }

                this.isLoading = false;

                this.unsetCard();

                this.clearSearch = !this.clearSearch;

                this.showAdd = !this.showAdd;

                window.scrollTo({
                    top: document.body.scrollHeight,
                    left: 0,
                    behavior: 'smooth'
                });
            })
            .catch(error => {
                console.log(error.response.data.message)

                this.snackbar = {
                    msg: error.response.data.message,
                    color: 'error',
                    close_color: 'white',
                    show: true
                };
                
                this.isLoading = false;

                this.unsetCard();

                this.clearSearch = !this.clearSearch;
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

                await this.$http.patch(`/scrape-list/${card.set_name}/${card.name}/notify-list`, notify);

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

                await this.$http.delete(`/scrape-list/${card.set_name}/${card.name}/notify-list?email=${this.$store.state.user.email}`);

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
        },
        toTop() {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });

            if(this.showListings) {
                for(let listing in this.showListings) {
                    this.$set(this.showListings, listing, false)
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>

#toolbar {
    background-color: #1565C0;
    border-radius: 5px;
}

.list-enter-active {
    transition: all 1s;
}

.list-leave-active {
  transition: all .3s;
}
.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>