<template>
    <v-row>
        <h1>Account Settings</h1>
        
        <v-col v-for="(card, index) in cards" :item="card" :key="index">
            <v-btn v-if="edit[card._id] == false" @click="editCard(card)" icon color="success">
                <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn v-if="edit[card._id]" @click="saveEdit(card)" icon color="success">
                <v-icon>mdi-floppy</v-icon>
            </v-btn>
        </v-col>
      </v-row>
</template>

<script>
export default {
    name: 'AccountSettings',
    data() {
        return {
            cards: [
                {
                    _id: 1,
                    name: 'Number 2'
                },
                {
                    _id: 2,
                    name: 'Number 2'
                },
                {
                    _id: 3,
                    name: 'Number 3'
                }
            ],
            edit: {}
        }
    },
    mounted() {
        if(this.cards.length > 0) {
            this.edit = {};
        
            for(let i = 0; i < this.cards.length; i++) {
                this.edit[this.cards[i]._id] = false;
            }
        }
    },
    methods: {
        editCard(card) {
            this.edit[card._id] = true;
            console.log(this.edit);
        },
        saveEdit(card) {
            this.edit[card._id] = false;
            console.log(this.edit);
        }
    }
}
</script>

<style lang="scss" scoped>

</style>