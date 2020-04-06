<template>
  <div id="app">
    <router-link :to="{name: 'home'}">Home</router-link>
    <router-link :to="{name: 'login'}">Login</router-link>
    <router-link :to="{name: 'register'}">Register</router-link>
    <router-link :to="{name: 'wish_list'}">WishList</router-link>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  beforeCreate() {
    this.$store.dispatch('check_auth')
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(error.response.data.message);
    });
  }
}
</script>

<style>
#app {

}
</style>