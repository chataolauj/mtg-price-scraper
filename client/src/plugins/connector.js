import axios from 'axios'

export let http = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true
})