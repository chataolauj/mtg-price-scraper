<template>
  <v-app style="height: 100vh">
        <v-app-bar app :color="app_bar.color" :flat="app_bar.isFlat">
            <router-link to="/">Home</router-link>
            <v-spacer></v-spacer>

            <Search style="width: 500px;" v-if="this.$router.currentRoute.name != 'home'" @selected_card="scrape" :loading="isLoading" :cardAdded="clearSearch"/>
            <v-spacer></v-spacer>

            <AuthModal  v-if="!this.$store.state.logged_in" @logged_in="showLoginSnack()"/>

            <v-menu offset-y transition="slide-y-transition" v-if="this.$store.state.logged_in">
                <template v-slot:activator="{ on: click}">
                <v-btn id="btn" class="pa-0" v-on="click" x-large text absolute right :ripple="false">
                    <v-icon>mdi-account</v-icon>
                    {{ $store.state.user.email }}
                    <v-icon>mdi-menu-down</v-icon>
                </v-btn>
                </template>
                <v-list>
                    <v-list-item to="/wish-list">
                        <v-icon class="mr-2">mdi-notebook-multiple</v-icon>
                        <v-list-item-title>Wish List</v-list-item-title>
                    </v-list-item>
                    <v-list-item to="/account-settings">
                        <v-icon class="mr-2">mdi-cog</v-icon>
                        <v-list-item-title>Settings</v-list-item-title>
                    </v-list-item>
                    
                    <v-list-item @click="logout()">
                        <v-icon class="mr-2">mdi-logout-variant</v-icon>
                        <v-list-item-title>Logout</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-content>
            <v-progress-linear
                v-if="isLoading"
                indeterminate
                absolute
                color="primary"
            ></v-progress-linear>

            <Snackbar :snack="snackbar"/>

            <v-container fluid style="width: 80%;">
                <router-view @account_deleted="showSnack"></router-view>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
/* eslint-disable no-unused-vars */
import Snackbar from './/components/Snackbar'
import AuthModal from './components/AuthModal'
import Search from './components/Search'

export default {
    name: 'App',
    components: {
        Snackbar,
        AuthModal,
        Search
    },
    data() {
        return {
            snackbar: {},
            app_bar: {
                isFlat: true,
                color: 'white'
            },
            card: {},
            isLoading: false,
            clearSearch: false
        }
    },
    beforeCreate() {
        this.$store.dispatch('check_auth').catch(error => console.log(error));
    },
    methods: {
        showSnack(msg) {
            this.snackbar = {
                msg: msg,
                color: 'success',
                close_color: 'white',
                show: true
            }
        },
        async logout() {
            await this.$store.dispatch('logout')
            .then(response => {
                if(this.$router.currentRoute.name != 'home') {
                    this.$router.push('/');
                }
                
                console.log(response.data.message);
            })
            .catch(error => console.log(error));
        },
        async scrape(card) {
            this.isLoading = true;

            await this.$http.post('/scrape-list', card)
            .then(async (response) => {
                if(response.status == 200 || response.status == 204) {
                    await this.$http.put(`/scrape-list/${card.set_name}/${card.name}/websites`)
                    .then(() => {
                        this.isLoading = false;
                        this.clearSearch = !this.clearSearch;
                        this.$router.push({name: 'scrape-results', params: {
                            card: card, 
                            set_name: card.set_name.toLowerCase().replace(/:?,?\s+/g, "-"), 
                            card_name: card.name.toLowerCase().replace(/:?,?\s+/g, "-")
                        }});
                    })
                    .catch(error => {
                        console.log(error.response)

                        this.isLoading = false;

                        this.snackbar = {
                            msg: error.response.data.message,
                            color: 'error',
                            close_color: 'white',
                            show: true
                        }
                    });
                }
            })
            .catch(error => {
                console.log(error.response)

                this.isLoading = false;

                this.snackbar = {
                    msg: error.response.data.message,
                    color: 'error',
                    close_color: 'white',
                    show: true
                }
            });
        }
    },
    watch: {
        $route(to, from) {
            if(to.path == '/') {
                this.app_bar.isFlat = true;
                this.app_bar.color = "white";
            }
            else {
                this.app_bar.isFlat = false;
                this.app_bar.color = "amber accent-3";
            }
        }
    }
}
</script>

<style lang="scss">
* {
    box-sizing: border-box;
}

#btn {
    text-transform: lowercase;

    &::before {
        color: transparent;
    }
}
</style>