// js/animations.js
export function initMotorAnimaciones() {
    // Agrupamos los efectos en un solo listener para mejor rendimiento
    document.addEventListener('mousemove', (e) => {
        // 1. Parallax con mousemove
        const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.02;
        const hero = document.querySelector('.hero-content');
        
        if (hero) {
            requestAnimationFrame(() => {
                hero.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        }

        // 2. Efecto Magnético en botones
        const botones = document.querySelectorAll('.btn-magnetic');
        botones.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);

            // Si el mouse está cerca del botón, se mueve hacia él
            if (Math.abs(x) < 60 && Math.abs(y) < 60) {
                btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
            } else {
                btn.style.transform = `translate(0, 0)`;
            }
        });
    });
} // <--- Esta llave cierra la función principal