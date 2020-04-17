import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'
import Home from '@/views/Home'
import AccountSettings from '@/views/AccountSettings'
import Login from '@/views/Login'
import Register from '@/views/Register'
import WishList from '@/views/WishList'

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
            path: '/login',
            name: 'login',
            component: Login,
            beforeEnter: async (to, from, next) => {
                await store.dispatch('check_auth')
                .then(() => next('/'))
                .catch(() => next());
            }
        },
        {
            path: '/register',
            name: 'register',
            component: Register,
            beforeEnter: async (to, from, next) => {
                await store.dispatch('check_auth')
                .then(() => { next('/'); })
                .catch(() => { next(); });
            }
        },
        {
            path: '/account_settings',
            name: 'account_settings',
            component: AccountSettings
        },
        {
            path: '/wish_list',
            name: 'wish_list',
            component: WishList,
            meta: {
                requiresAuth: true
            }
        }
    ]
});

router.beforeEach((to, from, next) => {
    if(to.meta.requiresAuth && !store.state.logged_in) {
        next({ name: 'login' });
    }
    else {
        next();
    }
})

export default router;