// js/ui.js
export const UIService = {
    // Requerimiento: Manipulación del DOM (createElement, appendChild, innerHTML)
    renderRecetas(recetas, contenedor) {
        if (!contenedor) return;
        contenedor.innerHTML = '';

        if (recetas.length === 0) {
            contenedor.innerHTML = '<p class="empty-msg">No hay recetas en la base de datos.</p>';
            return;
        }

        recetas.forEach(receta => {
            const card = document.createElement('div');
            card.className = 'recipe-card';

            const imgPath = receta.imagen_url || 'https://via.placeholder.com/300x200?text=CookNet';

            card.innerHTML = `
                <img src="${imgPath}" alt="${receta.titulo}" style="width:100%; border-radius:10px; height:200px; object-fit:cover;">
                <div class="card-body" style="padding:15px;">
                    <h3 style="margin:10px 0;">${receta.titulo}</h3>
                    <p style="color:#666; font-size:0.9rem;">${receta.descripcion}</p>
                    <div class="meta" style="margin-top:15px; font-weight:bold; color:#e67e22;">
                        <span>📂 ${receta.categoria}</span> | <span>⏱️ ${receta.tiempo || 0} min</span>
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });
    },

    // Requerimiento: Mensajes dinámicos en pantalla
    mostrarMensaje(mensaje, tipo, contenedorPadre) {
        // Eliminar alertas previas para no amontonar (Requerimiento: remove)
        const alertaPrevia = document.querySelector('.alerta-dinamica');
        if (alertaPrevia) alertaPrevia.remove();

        const div = document.createElement('div');
        div.className = `alerta-dinamica alerta-${tipo}`;
        div.textContent = mensaje;

        // Estilos dinámicos según el tipo
        Object.assign(div.style, {
            padding: '15px',
            margin: '20px 0',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'white',
            fontSize: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backgroundColor: tipo === 'exito' ? '#27ae60' : '#e74c3c'
        });

        // Insertar al principio del formulario o contenedor (Requerimiento: prepend)
        contenedorPadre.prepend(div);

        // Desvanecer y eliminar automáticamente después de 3.5 segundos
        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transition = 'opacity 0.5s ease';
            setTimeout(() => div.remove(), 500);
        }, 3000);
    }
};