/* eslint-disable no-unused-vars */

import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'
import { source, refreshToken } from './connector'
import Home from '@/views/Home'
import AccountSettings from '@/views/AccountSettings'
import WishList from '@/views/WishList'
import ScrapeResults from '@/views/ScrapeResults'
import ForgotPassword from '@/views/ForgotPassword'
import ResetPassword from '@/views/ResetPassword'

Vue.use(VueRouter);

const router =  new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/account-settings',
            name: 'account-settings',
            component: AccountSettings,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/wish-list',
            name: 'wish-list',
            component: WishList,
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/scrape-results/:set_name/:card_name',
            name: 'scrape-results',
            component: ScrapeResults
        },
        {
            path: '/forgot-password',
            name: 'forgot-password',
            component: ForgotPassword
        },
        {
            path: '/reset-password/:token',
            name: 'reset-password',
            component: ResetPassword,
            props: true
        }
    ]
});

router.beforeEach((to, from, next) => {
    if(to.meta.requiresAuth && !store.state.logged_in) {
        next({ name: 'home' });
    }
    else {
        next();
    }

    if(to.path == '/') {
        store.commit('change_app_bar', {color: 'white', isFlat: true});
    }
    else {
        store.commit('change_app_bar', {color: 'amber accent-3', isFlat: false});
    }

    if(store.state.cancel) {
        store.dispatch('cancelScrape');
    }
});

router.afterEach((to, from) => {
    if(from.name == 'scrape-results') {
        store.dispatch('addVisitedScrape', {path: from.path, card: store.state.card})
    }
});

export default router;