<template>
  <v-app>
    <v-app-bar app color="white" flat>
      <AuthModal  v-if="!this.$store.state.logged_in"/>
      <v-btn @click="logout()" v-if="this.$store.state.logged_in" x-large icon absolute right>
        <v-icon>mdi-account</v-icon>
      </v-btn>

      <router-link to="/">Home</router-link>
      <router-link to="/wish_list" v-if="this.$store.state.logged_in">Wish List</router-link>
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import AuthModal from './components/AuthModal'

export default {
  name: 'App',
  components: {
    AuthModal
  },
  beforeCreate() {
    this.$store.dispatch('check_auth')
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error.response.data.message);
    });
  },
  methods: {
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

<style lang="scss">
* {
  box-sizing: border-box;
}
</style>