import axios from 'axios'

export let http = axios.create({
    baseURL: process.env.PORT,
    withCredentials: true
})

export const CancelToken = axios.CancelToken;