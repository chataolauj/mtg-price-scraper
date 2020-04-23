<template>
    <v-snackbar v-model="snackbar.show" top :color="snackbar.color" :timeout="5000">
        {{snackbar.msg}}
        <v-btn small icon :color="snackbar.close_color" class="pa-0 pr-2 no-outline" @click="snackbar.show = false">
            <v-icon>mdi-close-circle</v-icon>
        </v-btn>
    </v-snackbar>
</template>

<script>
export default {
    name: 'Snackbar',
    props: {
        snack: Object
    },
    data() {
        return {
            snackbar: {
                msg: '',
                color: '',
                close_color: '',
                show: false
            }
        }
    },
    watch: {
        snack() {
            this.snackbar = this.snack;
        }
    }
}
</script>

<style>

</style>