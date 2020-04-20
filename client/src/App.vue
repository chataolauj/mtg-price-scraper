<template>
  <v-app style="height: 100vh">
    <v-app-bar app color="white" flat class="">
      <router-link to="/">Home</router-link>
      <v-spacer></v-spacer>

      <Search v-show="this.$router.currentRoute.name != 'home'"/>
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
      <v-container fluid>
        <v-snackbar v-model="login_success" top color="success" :timeout="6000">
          Successfully logged in!
          <v-btn small icon color="error" class="pa-0 no-outline" @click="login_success = false">
            <v-icon>mdi-close-circle</v-icon>
          </v-btn>
        </v-snackbar>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
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
      login_success: false,
      register_success: false
    }
  },
  beforeCreate() {
    this.$store.dispatch('check_auth').catch(error => console.log(error));
  },
  methods: {
    showLoginSnack() {
      this.login_success = true;
      console.log(this.login_success)
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