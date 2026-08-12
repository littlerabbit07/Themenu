const descriptions = {
  files: "A server container that's just a file server accessible from a web browser. Lightweight, fast, and exposed via HTTP.",
  pwas: "Built with HTML, CSS, and JS. Uses a service worker for offline work and a manifest for installability. Feels like a native app.",
  arduino: "An Arduino cat feeder using an RTC and SG90 servo to release food at set hours. Feeds automatically even when you're away.",
  blog: "A blog made with Flask on a Linux server. Post and manage articles from your own machine. Uses Gunicorn and Nginx.",
  feeder: "Automated feeder controlled by time, reliable when you're not home. Built for simplicity with reusable hardware."
};

const tabs = document.querySelectorAll('.tab');
const typewriter = document.getElementById('typewriter-text');
const title = document.getElementById('section-title');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const section = tab.dataset.target;
    title.textContent = section.charAt(0).toUpperCase() + section.slice(1);
    typewriter.textContent = '';

    typeText(descriptions[section]);
  });
});

function typeText(text, i = 0) {
  if (i < text.length) {
    typewriter.textContent += text.charAt(i);
    setTimeout(() => typeText(text, i + 1), 25);
  }
}
