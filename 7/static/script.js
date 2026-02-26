document.addEventListener('DOMContentLoaded', () => {
    const headers = document.querySelectorAll('.file-container h2');

    headers.forEach(header => {
        header.addEventListener('mouseover', () => {
            header.style.transition = 'font-size 0.3s ease';
            header.style.fontSize = '1.5em';
        });

        header.addEventListener('mouseout', () => {
            header.style.fontSize = '1.2em'; 
        });
    });
});
