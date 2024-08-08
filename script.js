// Utils
const clamp = (min, max, value) => Math.max(min, Math.min(max, value));

const lerp = (min, max, value) => (1 - value) * min + value * max;

const easeInOutSine = x => -(Math.cos(Math.PI * x) - 1) / 2;

// Circle bar logic
const createCircleBar = (width, height, progress, color) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    [canvas.width, canvas.height] = [width, height];
    
    const offset = -Math.PI / 2;
    const lineWidth = 15;
    const radius = Math.min(width / 2, height / 2);
    const duration = 600;
    let inProgress = false;
    let isDrawed = false;
    
    const reset = () => {
        context.clearRect(0, 0, width, height);
        isDrawed = false;
    };
    
    const draw = progress => {
        const angle = Math.PI / 50 * progress;
        context.clearRect(0, 0, width, height);
        context.lineWidth = lineWidth;
        context.lineCap = 'round';
        
        context.beginPath();
        context.arc(width / 2, height / 2, radius - lineWidth * 1.5, 0, Math.PI * 2);
        context.strokeStyle = '#272727';
        context.stroke();
        context.closePath();
        
        context.beginPath();
        context.arc(width / 2, height / 2, radius - lineWidth / 2, offset, angle + offset);
        context.strokeStyle = color;
        context.stroke();
        context.closePath();
    };
    
    const animate = () => {
        if (inProgress || isDrawed) {
            return;
        }
        
        const start = performance.now();
        inProgress = true;
        
        const step = () => {
            const diff = performance.now() - start;
            const current = clamp(0, progress, lerp(0, progress, easeInOutSine(diff / duration)));
            draw(current);
            
            if (diff <= duration) {
                requestAnimationFrame(step);
            } else {
                inProgress = false;
                isDrawed = true;
            }
        };
        
        requestAnimationFrame(step);
    };
    
    return {
        canvas,
        draw,
        animate,
        reset
    };
};

// Animation
const circleBars = new WeakMap();

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.intersectionRatio === 0) {
        circleBars.get(entry.target)?.reset();
    } else if (entry.intersectionRatio >= 0.2) {
        circleBars.get(entry.target)?.animate();
    }
}), { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] });

document.querySelectorAll('.progress').forEach(element => {
    const { progress, color } = element.dataset;
    const circleBar = createCircleBar(150, 150, parseFloat(progress || '0'), color || '#000000');
    
    circleBars.set(circleBar.canvas, circleBar);
    observer.observe(circleBar.canvas);
    element.prepend(circleBar.canvas);
});
