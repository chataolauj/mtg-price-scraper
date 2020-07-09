import axios from 'axios'

const port = process.env.PORT || 5000;

export let http = axios.create({
    baseURL: port,
    withCredentials: true
})

export const CancelToken = axios.CancelToken;