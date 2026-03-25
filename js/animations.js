// js/animations.js
export function initMotorAnimaciones() {
    // Parallax con mousemove
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.02;
        const hero = document.querySelector('.hero-content');
        
        if (hero) {
            requestAnimationFrame(() => {
                hero.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        }

        // Efecto Magnético en botones
        const botones = document.querySelectorAll('.btn-magnetic');
        botones.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);

            if (Math.abs(x) < 60 && Math.abs(y) < 60) {
                btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
            } else {
                btn.style.transform = `translate(0, 0)`;
            }
        });
    });
}