// js/dom.js
export function renderizarRecetas(lista, contenedor) {
    if (!contenedor) return;
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = '<div class="empty-msg">🥺 No hay recetas disponibles.</div>';
        return;
    }

    const fragmento = document.createDocumentFragment();

    lista.forEach(receta => {
        const card = document.createElement('div');
        card.className = 'recipe-card fade-in';
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${receta.imagen || 'https://via.placeholder.com/300'}" alt="${receta.nombre}">
            </div>
            <div class="card-content" style="padding: 15px;">
                <h3>${receta.nombre}</h3>
                <p>${(receta.ingredientes || '').substring(0, 60)}...</p>
                <button class="btn-primary btn-ver-receta" style="width:100%; margin-top:10px;">📖 Ver Receta</button>
            </div>
        `;

        // Evento seguro para el botón
        card.querySelector('.btn-ver-receta').addEventListener('click', () => {
            alert(`Preparación:\n${receta.instrucciones}`);
        });

        fragmento.appendChild(card);
    });

    contenedor.appendChild(fragmento);
}

export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}