// js/carousel.js

// ASEGÚRATE DE QUE EL NOMBRE SEA EXACTAMENTE ESTE:
export class CoockNetCarousel { 
    constructor(id) {
        this.container = document.getElementById(id);
        if (!this.container) return;
        
        this.track = this.container.querySelector('.carousel-track');
        this.index = 0;
        
        if (this.track && this.track.children.length > 0) {
            this.init();
        }
    }

    init() {
        setInterval(() => this.next(), 5000);
        
        let startX = 0;
        this.container.addEventListener('touchstart', e => startX = e.touches[0].clientX);
        this.container.addEventListener('touchend', e => {
            if (startX - e.changedTouches[0].clientX > 50) this.next();
        });
    }

    next() {
        const slides = this.track.children.length;
        this.index = (this.index + 1) % slides;
        this.track.style.transform = `translateX(-${this.index * 100}%)`;
    }
}