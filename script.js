// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Add click event to stars for rating
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Create a simple chart in the graph placeholder
    const graph = document.querySelector('.graph-placeholder');
    if (graph) {
        // This would be more elaborate with actual charting library
        const canvas = document.createElement('div');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'relative';
        
        // Add some random data points
        for (let i = 0; i < 20; i++) {
            const point = document.createElement('div');
            const rating = Math.random() * 10;
            const kills = Math.random() * 100;
            
            point.style.position = 'absolute';
            point.style.width = '10px';
            point.style.height = '10px';
            point.style.backgroundColor = '#ff0000';
            point.style.borderRadius = '50%';
            point.style.left = `${rating * 8}%`;
            point.style.bottom = `${kills}%`;
            point.style.transform = 'translate(-50%, 50%)';
            
            // Bigger dots for more kills
            const size = 5 + (kills / 20);
            point.style.width = `${size}px`;
            point.style.height = `${size}px`;
            
            canvas.appendChild(point);
        }
        
        // Add axes
        const xAxis = document.createElement('div');
        xAxis.style.position = 'absolute';
        xAxis.style.bottom = '0';
        xAxis.style.left = '0';
        xAxis.style.right = '0';
        xAxis.style.height = '1px';
        xAxis.style.backgroundColor = '#ff0000';
        canvas.appendChild(xAxis);
        
        const yAxis = document.createElement('div');
        yAxis.style.position = 'absolute';
        yAxis.style.bottom = '0';
        yAxis.style.left = '0';
        yAxis.style.top = '0';
        yAxis.style.width = '1px';
        yAxis.style.backgroundColor = '#ff0000';
        canvas.appendChild(yAxis);
        
        // Add labels
        const xLabel = document.createElement('div');
        xLabel.textContent = 'IMDB Rating';
        xLabel.style.position = 'absolute';
        xLabel.style.bottom = '-30px';
        xLabel.style.left = '50%';
        xLabel.style.transform = 'translateX(-50%)';
        xLabel.style.color = '#ff0000';
        canvas.appendChild(xLabel);
        
        const yLabel = document.createElement('div');
        yLabel.textContent = 'Kill Count';
        yLabel.style.position = 'absolute';
        yLabel.style.left = '-40px';
        yLabel.style.top = '50%';
        yLabel.style.transform = 'translateY(-50%) rotate(-90deg)';
        yLabel.style.color = '#ff0000';
        canvas.appendChild(yLabel);
        
        graph.appendChild(canvas);
    }

    // Add scroll snapping behavior
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            setTimeout(() => {
                const sections = document.querySelectorAll('section');
                let currentSection = 0;
                
                sections.forEach((section, index) => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                        currentSection = index;
                    }
                });
                
                sections[currentSection].scrollIntoView({ behavior: 'smooth' });
                isScrolling = false;
            }, 100);
        }
    });
});