// Manejo de persistencia en LocalStorage
export const DataService = {
    save(recetas) {
        localStorage.setItem('safecook_recetas', JSON.stringify(recetas));
    },

    get() {
        const data = localStorage.getItem('safecook_recetas');
        return data ? JSON.parse(data) : [];
    }
};