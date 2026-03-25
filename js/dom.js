// js/dom.js
// CUMPLE REQUISITO: Separación de responsabilidades y Manipulación del DOM

export const DOMService = {
    renderRecetas(recetas, contenedor) {
        if (!contenedor) return;
        contenedor.innerHTML = '';

        if (!recetas || recetas.length === 0) {
            contenedor.innerHTML = '<div class="empty-msg">🥺 No hay recetas disponibles.</div>';
            return;
        }

        // CUMPLE REQUISITO: Minimización de reflows
        const fragmento = document.createDocumentFragment();

        recetas.forEach(receta => {
            const card = document.createElement('div');
            card.className = 'recipe-card fade-in';
            
            const nombre = receta.nombre || 'Sin nombre';
            const imgPath = receta.imagen ? `http://localhost:3000${receta.imagen}` : 'https://via.placeholder.com/300x200';
            const ingred = receta.ingredientes || 'Sin ingredientes';

            card.innerHTML = `
                <div class="card-image">
                    <img src="${imgPath}" loading="lazy" alt="${nombre}" style="width:100%; height:200px; object-fit:cover; border-radius:10px 10px 0 0;">
                </div>
                <div class="card-content" style="padding:15px;">
                    <h3 style="margin:0;">${nombre}</h3>
                    <p style="font-size:0.8rem; color:#666; height:40px; overflow:hidden; margin:10px 0;">${ingred.substring(0, 60)}...</p>
                    <span style="color:#27ae60; font-weight:bold; font-size:0.8rem;">📂 ${receta.categoria || 'General'}</span>
                    <button class="btn-ver-detalles" style="width:100%; margin-top:10px; background:#27ae60; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">Ver Detalles</button>
                </div>
            `;

            card.querySelector('.btn-ver-detalles').addEventListener('click', () => {
                alert(`📖 ${nombre}\n\n🍎 INGREDIENTES:\n${receta.ingredientes}\n\n👨‍🍳 INSTRUCCIONES:\n${receta.instrucciones}`);
            });

            fragmento.appendChild(card);
        });

        contenedor.appendChild(fragmento);
    },

    mostrarNotificacion(mensaje, tipo = 'exito', contenedorPadre = document.body) {
        const alertaPrevia = document.querySelector('.alerta-dinamica');
        if (alertaPrevia) alertaPrevia.remove();

        const div = document.createElement('div');
        div.className = `alerta-dinamica alerta-${tipo} fade-in`;
        div.textContent = mensaje;

        Object.assign(div.style, {
            position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px',
            borderRadius: '8px', color: 'white', fontWeight: 'bold', zIndex: '1000',
            backgroundColor: tipo === 'exito' ? '#27ae60' : '#e74c3c',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        });

        contenedorPadre.prepend(div);

        setTimeout(() => {
            div.style.opacity = '0';
            setTimeout(() => div.remove(), 500);
        }, 3000);
    }
};

// CUMPLE REQUISITO OPTIMIZACIÓN: Debounce
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// CUMPLE REQUISITO OPTIMIZACIÓN: Throttle
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}