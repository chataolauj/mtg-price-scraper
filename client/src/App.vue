<template>
  <v-app>
        <v-app-bar app :color="this.$store.state.app_bar.color" :flat="this.$store.state.app_bar.isFlat">
            <router-link v-if="$router.currentRoute.name == 'home'" to="/">Home</router-link>
            <router-link v-else to="/">
                <v-img src="../public/images/app_bar_logo.png" height="50" width="75"></v-img>
            </router-link>
            <v-spacer></v-spacer>

            <Search 
                v-if="this.$router.currentRoute.name != 'home' && $vuetify.breakpoint.smAndUp" @selected_card="scrape" 
                :style="$vuetify.breakpoint.sm ? 'width: 400px;' : 'width: 500px;'"
                :loading="isLoading" :cardAdded="clearSearch"
            />

            <v-btn 
                v-else-if="this.$router.currentRoute.name != 'home' && $vuetify.breakpoint.xsOnly"
                @click="showSearch = !showSearch" color="black" icon large
                class="mr-10"
            >
                <v-icon>{{showSearch ? 'mdi-close' : 'mdi-magnify'}}</v-icon>
            </v-btn>
            
            <v-spacer v-if="$vuetify.breakpoint.smAndUp"></v-spacer>

            <AuthModal v-if="this.$store.state.logged_in == false" @logged_in="showSnack()"/>

            <v-menu v-else offset-y transition="slide-y-transition"> <!-- User Menu -->
                <template v-slot:activator="{ on: click}">
                    <v-btn 
                        id="btn" class="pa-0" v-on="click" x-large text absolute right 
                        :ripple="false" :icon="$vuetify.breakpoint.mdAndDown"
                    >
                        <v-icon color="black">mdi-account</v-icon>
                        {{ $vuetify.breakpoint.lgAndUp ? $store.state.email : '' }}
                        <v-icon :class="{'ml-n2': $vuetify.breakpoint.mdAndDown}" color="black">mdi-menu-down</v-icon>
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

            <v-expand-transition>
                <Search 
                    v-if="showSearch && $vuetify.breakpoint.xs" @selected_card="scrape" 
                    :loading="isLoading" :cardAdded="clearSearch"
                    class="pa-5"
                />
            </v-expand-transition>

            <Snackbar :snack="snackbar"/>

            <v-container fluid :class="[$vuetify.breakpoint.smAndDown && $router.currentRoute.name != 'home' ? 'view-width large' : 'view-width small']">
                <transition name="component-fade" mode="out-in">
                    <router-view @account_deleted="showSnack" @reset_password="showSnack"></router-view>
                </transition>
            </v-container>
        </v-content>
    </v-app>
</template>

<script>
/* eslint-disable no-unused-vars */
import Snackbar from './/components/Snackbar'
import AuthModal from './components/AuthModal'
import Search from './components/Search'
import { source, refreshToken } from './plugins/connector'

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
            card: {},
            isLoading: false,
            clearSearch: false,
            showSearch: false
        }
    },
    beforeCreate() {
        this.$store.dispatch('checkAuth').catch(error => console.log(error));
    },
    beforeMount() {
        this.$store.commit('clearPreviousScrapes');
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
                
                this.showSnack(response.data.message);
            })
            .catch(error => console.log(error));
        },
        async scrape(card) {
            this.isLoading = true;

            try {
                await this.$store.dispatch('scrape', card)
                .then(() => {
                    this.isLoading = false;
                    this.clearSearch = !this.clearSearch;
                    this.$router.push({name: 'scrape-results', params: {
                        set_name: card.set_name.toLowerCase().replace(/:?,?\s+/g, "-"), 
                        card_name: card.name.toLowerCase().replace(/:?,?\s+/g, "-")
                    }});
                });
            } catch (error) {
                this.isLoading = false;
                this.clearSearch = !this.clearSearch;

                if(error.response) {
                    this.snackbar = {
                        msg: error.response.data?.message,
                        color: 'error',
                        close_color: 'white',
                        show: true
                    }
                }
            }
        }
    },
    watch: {
        $route(to, from) {
            this.showSearch = false;

            if(to.name != 'scrape-results') {
                this.clearSearch = !this.clearSearch;
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

.view-width {
    &.small {
        width: 80%;
    }

    &.large {
        width: 100%;
    }
}

.component-fade-enter-active, .component-fade-leave-active {
    transition: opacity .3s ease;
}
.component-fade-enter, .component-fade-leave-to {
    opacity: 0;
}

.app-bar-enter-active {
    transition: all 5s;
}

.app-bar-leave-active {
  transition: all 5s;
}
.app-bar-enter, .app-bar-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>