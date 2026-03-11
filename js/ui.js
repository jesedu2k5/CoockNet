// js/ui.js
export const UIService = {
    renderRecetas(recetas, contenedor) {
        if (!contenedor) return;
        contenedor.innerHTML = ''; 

        if (!recetas || recetas.length === 0) {
            contenedor.innerHTML = '<div class="empty-msg">🥺 No hay recetas en la base de datos.</div>';
            return;
        }

        const fragmento = document.createDocumentFragment();

        recetas.forEach(receta => {
            const card = document.createElement('div');
            card.className = 'recipe-card fade-in';

            // ASIGNACIÓN SEGÚN TUS COLUMNAS REALES
            const nombre = receta.nombre || 'Receta sin nombre';
            const imagen = receta.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
            // Usamos ingredientes como descripción corta
            const resumen = receta.ingredientes ? receta.ingredientes.substring(0, 60) + '...' : 'Sin ingredientes detallados';
            const cat = receta.categoria || 'General';

            card.innerHTML = `
                <div class="card-image">
                    <img src="${imagen}" alt="${nombre}" style="width:100%; height:200px; object-fit:cover; border-radius:10px 10px 0 0;">
                </div>
                <div class="card-content" style="padding:15px;">
                    <h3 style="margin:0 0 10px 0;">${nombre}</h3>
                    <p style="color:#666; font-size:0.85rem; height:40px; overflow:hidden;">${resumen}</p>
                    <div style="margin: 10px 0; font-size: 0.8rem; color: #27ae60; font-weight: bold;">
                        🏷️ ${cat}
                    </div>
                    <button class="btn-primary btn-ver-receta" style="width:100%; margin-top:10px; cursor:pointer; border:none; padding:10px; border-radius:5px;">📖 Ver Receta Completa</button>
                </div>
            `;

            // Configurar el botón de detalles
            card.querySelector('.btn-ver-receta').addEventListener('click', () => {
                alert(`📖 ${nombre.toUpperCase()}\n\n🍎 INGREDIENTES:\n${receta.ingredientes}\n\n👨‍🍳 INSTRUCCIONES:\n${receta.instrucciones}`);
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

export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}