<template>
    <div id="search">
        <v-text-field 
            ref="input"
            v-model="card_name" :dark="$parent.$options.name == 'WishList'"
            :rounded="isHomeRoute" outlined single-line flat :shaped="isFocused && isHomeRoute && queried_cards.length > 0"
            @focus="isFocused = true"  @blur="isFocused = false" 
            :loading="searchLoading || selectedLoading && isHomeRoute"
            prepend-inner-icon="mdi-magnify" hide-details
        >
            <template v-slot:progress>
                <v-progress-circular
                    class="mt-3"
                    v-if="searchLoading || selectedLoading"
                    indeterminate
                    :color="$parent.$options.name == 'WishList' ? 'amber accent-3' : 'primary'"
                    :width="2"
                    :size="30"
                ></v-progress-circular>
            </template>
        </v-text-field>
        <v-list id="v-list" :style="list_style" v-show="queried_cards.length && isFocused" class="pa-0 overflow-y-auto" max-height="300" two-line>
            <v-list-item 
                v-for="(card, index) in queried_cards" :item="card" :key="index"
                @mouseover="isHovering = true" @mouseleave="isHovering = false" @mousedown="setCard(card)"
                :class="{ active: isHovering }"
            >
                <v-list-item-content>
                    <v-list-item-title class="mb-2" style="color: black">{{card.name}}</v-list-item-title>
                    <v-list-item-subtitle style="color: rgba(0, 0, 0, .6)">{{card.set_name}}</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    name: 'Search',
    props: {
        cardAdded: Boolean,
        loading: Boolean
    },
    data() {
        return {
            list_style: {},
            window_width: null,
            isHomeRoute: true,
            isFocused: false,
            isHovering: false,
            queried_cards: [],
            card_name: '',
            searchLoading: false,
            selectedLoading: false,
            selected: false,
            isAppBar: false
        }
    },
    mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize)
        });

        this.$nextTick(() => {
            this.onResize();
        })

        if(this.$router.currentRoute.name != 'home') {
            this.isHomeRoute = false;
        }
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize)
    },
    methods: {
        onResize() {
            this.$set(this.list_style, 'width', this.$refs.input.$el.clientWidth + 'px');
        }, 
        delaySearch() {
            this.searchLoading = true;

            this.searchCards();
        },
        searchCards: _.debounce(async function() {
            await this.$http.get(`/cards?card_name=${this.card_name}`)
            .then(response => {
                this.queried_cards = response.data;
                this.searchLoading = false;
            })
            .catch(error => {
                console.log(error)

                this.searchLoading = false;
            });
        }, 500),
        setCard(card) {
            this.$emit('selected_card', card);
            this.selected = true;
            this.card_name = `${card.name} - ${card.set_name}`;
            this.queried_cards = [];
        }
    },
    watch: {
        card_name() {
            if(this.card_name.length > 2 && !this.selected) {
                this.delaySearch();
            }
            else if(this.card_name.length && this.selected) {
                this.selected = false;
            }
            else {
                this.$emit('unset_card');
                this.queried_cards = [];
            }
        },
        loading() {
            this.selectedLoading = this.loading;
        },
        cardAdded() {
            this.card_name = '';
            this.selected = false;
        }
    }
}
</script>

<style lang="scss" scoped>
* {
    box-sizing: border-box;
}

#search {
    #v-list {
        z-index: 1000;
        position: absolute;
        color: black !important;
        background-color: white;
        box-shadow: 0px 0px 5px 2px rgba(0, 0, 0, .3);
    }

    .active {
        &:hover {
            cursor: pointer;
            color: #FFC400;
            background-color: #1565C0;
        }
    }
}
</style>