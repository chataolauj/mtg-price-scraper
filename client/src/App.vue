<template>
  <v-app style="height: 100vh">
        <v-app-bar app :color="app_bar.color" :flat="app_bar.isFlat" class="">
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
                <v-list-item to="/account_settings">
                    <v-icon class="mr-2">mdi-cog</v-icon>
                    <v-list-item-title>Settings</v-list-item-title>
                </v-list-item>
                <v-list-item to="/wish_list">
                <v-icon class="mr-2">mdi-notebook-multiple</v-icon>
                    <v-list-item-title>Wish List</v-list-item-title>
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
            <v-container fluid style="width: 80%;">
                <router-view :card="card"></router-view>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
/* eslint-disable no-unused-vars */
import AuthModal from './components/AuthModal'
import Search from './components/Search'

export default {
    name: 'App',
    components: {
        AuthModal,
        Search
    },
    data() {
        return {
            snackbar: {
                msg: '',
                color: '',
                close_color: ''
            },
            app_bar: {
                isFlat: this.$router.currentRoute.name == 'home' ? true :  false,
                color: this.$router.currentRoute.name == 'home' ? 'white' : 'amber accent-3'
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
        showLoginSnack() {
            
        },
        async logout() {
            await this.$store.dispatch('logout')
            .then(response => {
                if(this.$router.currentRoute.name == 'wish_list') {
                    this.$router.push('/');
                }
                console.log(response.data.message);
            })
            .catch(error => console.log(error));
        },
        async scrape(card) {
            console.log(this.card)
            console.log(this.$router.currentRoute.name)
            this.isLoading = true;

            await this.$http.post('/scrape-list', card)
            .then(async (response) => {
                if(response.status == 200 || response.status == 204) {
                    await this.$http.put('/scrape-list/card', card)
                    .then(() => {
                        this.isLoading = false;
                        this.clearSearch = !this.clearSearch;

                        if(this.$router.currentRoute.name != 'scrape-results') {
                            this.$router.push({name: 'scrape-results', params: { card: card } });
                        }
                        else {
                            this.card = card;
                            console.log(this.card)
                        }
                    })
                    .catch(error => {
                        console.log(error.response)

                        this.isLoading = false;
                    });
                }
            })
            .catch(error => {
                console.log(error.response)

                this.isLoading = false;
            });
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