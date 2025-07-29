const items = document.querySelectorAll('.menu-item');

items.forEach(item => {
  const desc = item.querySelector('.description');
  const text = item.dataset.description;

  let typingTimeout;

  item.addEventListener('mouseenter', () => {
    desc.textContent = '';
    let i = 0;
    clearTimeout(typingTimeout);

    const type = () => {
      if (i < text.length) {
        desc.textContent += text.charAt(i);
        i++;
        typingTimeout = setTimeout(type, 30 + Math.random() * 30);
      }
    };

    type();
  });

  item.addEventListener('mouseleave', () => {
    clearTimeout(typingTimeout);
    desc.textContent = '';
  });
});
