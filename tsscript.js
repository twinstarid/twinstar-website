/* navigation */
function navigationclick(x) {
  x.classList.toggle("change");
}

const toggleBtn = document.querySelector('.navigation-toggle');
const sidebar = document.getElementById('navigation-sidebar');
const overlay = document.getElementById('navigation-sidebar-overlay');

toggleBtn.addEventListener('click', () => {
    const isActive = sidebar.classList.toggle('active');
    overlay.classList.toggle('active', isActive);
});
overlay.addEventListener('click', () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    toggleBtn.classList.remove('change');
});

/* promo and catalogue */
function setupInteractiveItems(selector) {
    const items = document.querySelectorAll(selector);
    items.forEach(item => {
        item.classList.add('ripple');
        item.addEventListener('click', (e) => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const link = item.getAttribute('data-link');
            if (link) {
                setTimeout(() => {
                    window.location.href = link;
                }, 300);
            }
        });
        item.addEventListener('mouseleave', () => item.classList.remove('active'));
    });
}
setupInteractiveItems('.promo-item');
setupInteractiveItems('.catalogue-item');

/* promo countdown */
function updateCountdown() {
    document.querySelectorAll(".promo-countdown").forEach(el => {
        const endTime = new Date(el.dataset.time).getTime();
        const now = new Date().getTime();
        let diff = endTime - now;
        if (diff <= 0) {
            el.textContent = "Expired!";
        } else {
            let h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            let m = Math.floor((diff / (1000 * 60)) % 60);
            let s = Math.floor((diff / 1000) % 60);
            el.textContent = `${h}j ${m}m ${s}d`;
        }
     });
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* catalogue category */
const catalogueButtons = document.querySelectorAll('.catalogue-category-button');
const catalogueContents = document.querySelectorAll('.catalogue-product');
catalogueButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        catalogueButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        catalogueContents.forEach(content => content.classList.remove('active'));
        const target = document.getElementById(btn.dataset.tab);
        target.classList.add('active');
    });
});

/* catalogue alignment */
function adjustCatalogueAlignment() {
  document.querySelectorAll('.catalogue-product.active').forEach(container => {
    const products = Array.from(container.children).filter(el => el.classList.contains('catalogue-item'));
    if (products.length === 0) return;
    const containerWidth = container.clientWidth;
    const productWidth = products[0].offsetWidth + 15;
    const perRow = Math.max(1, Math.round(containerWidth / productWidth));
    const remainder = products.length % perRow;
    if (products.length === 1) {
      container.style.justifyContent = 'center';
      return;
    }
    if (remainder === 1) {
      container.style.justifyContent = 'flex-start';
    } else {
      container.style.justifyContent = 'center';
    }
  });
}
window.addEventListener('load', adjustCatalogueAlignment);
window.addEventListener('resize', adjustCatalogueAlignment);
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => setTimeout(adjustCatalogueAlignment, 300));
});

/* effect */
function addRippleEffect(elements) {
    elements.forEach(el => {
        el.classList.add('ripple');
        el.addEventListener('click', function (e) {
            const circle = document.createElement('span');
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            const radius = diameter / 2;
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;
            circle.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;
            circle.style.position = 'absolute';
            circle.style.borderRadius = '50%';
            circle.style.background = 'rgba(255,255,255,0.35)';
            circle.style.transform = 'scale(0)';
            circle.style.animation = 'rippleAnim 0.6s linear';
            circle.style.pointerEvents = 'none';
            circle.style.zIndex = '10';
            this.appendChild(circle);
            circle.addEventListener('animationend', () => circle.remove());
        });
    });
}
addRippleEffect(document.querySelectorAll('.promo-item, .catalogue-category-button, .catalogue-item'));
