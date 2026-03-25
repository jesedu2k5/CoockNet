// js/cache.js
export const RecetasCache = {
    data: [],
    subscribers: [],

    subscribe(callback) {
        this.subscribers.push(callback);
    },

    set(recetas) {
        this.data = recetas;
        this.notify();
    },

    get() {
        return this.data;
    },

    notify() {
        this.subscribers.forEach(callback => callback(this.data));
    }
};