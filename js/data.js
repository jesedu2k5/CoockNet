// js/data.js
export const DataService = {
    // Guarda el borrador (Requerimiento de persistencia)
    saveDraft(datos) {
        sessionStorage.setItem('recipe_draft', JSON.stringify(datos));
    },
    getDraft() {
        const draft = sessionStorage.getItem('recipe_draft');
        return draft ? JSON.parse(draft) : null;
    },
    clearDraft() {
        sessionStorage.removeItem('recipe_draft');
    }
};