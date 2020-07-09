import axios from 'axios'

export let http = axios.create({
    baseURL: process.env.PORT || 5000,
    withCredentials: true
})

export const CancelToken = axios.CancelToken;