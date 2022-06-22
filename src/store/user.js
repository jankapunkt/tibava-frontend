import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useUserStore = defineStore('user', {
    // other options...
    state: () => {
        return {
            loggedIn: false,
        }
    },
    actions: {
        getCSRFToken() {
        },
        getUserData() {
        },
    },
    persist: true,
})