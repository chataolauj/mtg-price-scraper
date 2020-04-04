import axios from 'axios'

/* //const baseURL = axios.get('localhost:5000');
const proxy = 'https://cors-anywhere.herokuapp.com/';

async function register(user) {
    return axios.post(`${proxy}localhost:5000/register`, user)
    .then(function (response) {
        // handle success
        console.log(response);
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    });
}
 */
export default () => {
    return axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true
    })
}