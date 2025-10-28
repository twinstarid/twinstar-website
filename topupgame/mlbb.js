/* NAVIGATION */
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

/* ITEM SELECT */
const itemSelectButtons = document.querySelectorAll('.item-select-category-button');
const itemSelectContents = document.querySelectorAll('.item-select-product');

itemSelectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        itemSelectButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        itemSelectContents.forEach(content => content.classList.remove('active'));
        const target = document.getElementById(btn.dataset.tab);
        target.classList.add('active');
    });
});

document.querySelectorAll('.item-select-item-snk').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();

        const parent = btn.closest('.item-select-item');
        const itemName = parent.dataset.item || "Item Tidak Dikenal";
        const snkText = parent.dataset.snk || "⤷ Tidak ada informasi tambahan.";

        const overlay = document.createElement('div');
        overlay.className = 'item-select-item-snk-overlay';

        const popup = document.createElement('div');
        popup.className = 'item-select-item-snk-popup';
        popup.innerHTML = `
            <h3 class="item-select-item-snk-title">S&K ${itemName}</h3>
            <p class="item-select-item-snk-text">${snkText}</p>
            <button class="item-select-item-snk-btn">Understand</button>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        overlay.style.display = 'flex';

        const understandBtn = popup.querySelector('.item-select-item-snk-btn');
        understandBtn.addEventListener('click', () => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
                overlay.remove();
                }, 200);
        });

        overlay.addEventListener('click', (ev) => {
            if (ev.target === overlay) {
                ev.stopPropagation();
            }
        });

        document.body.style.overflow = '';
    });
});

/* ITEM & PAYMENT SELECT CONTROL */
const paymentSection = document.querySelector('.payment-select');
const paymentLists = document.querySelectorAll('.payment-select-list');
const paymentOptions = document.querySelectorAll('.payment-select-option');
const confirmButton = document.getElementById('confirmbutton');
let selectedItem = null;
let selectedPayment = null;

paymentSection.style.display = 'none';

document.querySelectorAll('.item-select-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.item-select-item.active').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        selectedItem = item;

        paymentSection.style.display = 'block';

        paymentLists.forEach(list => list.classList.remove('active'));
        const targetPayment = item.dataset.payment;
        const activePaymentList = document.getElementById(targetPayment);
        if (activePaymentList) activePaymentList.classList.add('active');

        paymentOptions.forEach(opt => opt.classList.remove('active'));
        selectedPayment = null;
    });
});

paymentOptions.forEach(option => {
    option.addEventListener('click', e => {
        e.stopPropagation();
        paymentOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        selectedPayment = option;
    });
});

/* GENERATE ORDER ID */
async function generateOrderId() {
    const SHEET_API = 'https://api.sheetbest.com/sheets/97b066c8-339f-43f4-be3b-fe4af8293305'; // ganti punyamu
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    function randomId() {
        let code = 'TSID-';
        for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    }

    try {
        const res = await fetch(SHEET_API);
        const data = await res.json();
        const usedIds = data.map(r => r.ORDER_ID);

        let newId;
        do {
            newId = randomId();
        } while (usedIds.includes(newId));

        await fetch(SHEET_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ORDER_ID: newId,
                TIMESTAMP: new Date().toISOString()
            })
        });

        console.log('Order ID tersimpan:', newId);
        return newId;
    } catch (err) {
        console.error('Gagal buat ORDER ID:', err);
        createPopup('Gagal Buat Order ID', 'Tidak bisa menyimpan ke Google Sheet.\nPastikan URL Sheet.best benar.', 'error');
        return 'TSID-ERROR';
    }
}

/* POPUP UTILITY */
function createPopup(title, message, type = 'error', waLink = null) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-order-button-overlay';
    const popup = document.createElement('div');
    popup.className = 'confirm-order-button-popup';
    popup.innerHTML = `
        <h3 class="confirm-order-button-title ${type}">${title}</h3>
        <p class="confirm-order-button-message">${message}</p>
        <div class="confirm-order-button-buttons">
            ${type === 'confirm'
                ? `<button class="confirm-order-button-btn cancel">Cancel</button>
                   <a href="${waLink}" target="_blank"><button class="confirm-order-button-btn confirm" id="confirm-order-button-confirm-link">Confirm</button></a>`
                : `<button class="confirm-order-button-btn ok">Back</button>`}
        </div>
    `;
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));

    if (type === 'confirm') {
        popup.querySelector('.cancel').addEventListener('click', () => overlay.remove());
    } else {
        popup.querySelector('.ok').addEventListener('click', () => overlay.remove());
    }
}

/* VALIDASI DAN KONFIRMASI */
confirmButton.addEventListener('click', async () => {
    const uid = mlbbUidEl.value.trim();
    const sid = mlbbSidEl.value.trim();
    const nowa = document.getElementById('nowa').value.trim();
    const nick = document.getElementById('mlbbnick').innerText
        .replace(/Selamat datang,/, '')
        .replace(/Pastikan beli sesuai.*/i, '')
        .trim() || 'Unknown';

    if (!uid || !sid || !nowa) {
        createPopup('Data Belum Lengkap', 'Harap isi semua informasi pelanggan terlebih dahulu!');
        return;
    }
    if (!selectedItem) {
        createPopup('Produk Belum Dipilih', 'Harap pilih produk terlebih dahulu!');
        return;
    }
    if (!selectedPayment) {
        createPopup('Metode Pembayaran Belum Dipilih', 'Harap pilih metode pembayaran terlebih dahulu!');
        return;
    }

    const orderId = await generateOrderId();
    const category = selectedItem.dataset.category;
    const product = selectedItem.dataset.product;
    const itemName = selectedItem.dataset.item;
    const price = selectedItem.dataset.price;
    const paymentMethod = selectedPayment.dataset.pay;

    const waLink = `https://wa.me/6285166310674?text=—%20𝖳𝗐𝗂𝗇𝗌𝗍𝖺𝗋%20𝖲𝗍𝗈𝗋𝖾%20𝗥𝗲𝗰𝗲𝗶𝗽𝘁%0A%0A·%20𝖼𝖺𝗍𝖾𝗀𝗈𝗋𝗒%20:%20${encodeURIComponent(category)}%0A·%20𝗉𝗋𝗈𝖽𝗎𝖼𝗍%20:%20${encodeURIComponent(product)}%0A·%20𝗂𝗍𝖾𝗆%20:%20${encodeURIComponent(itemName)}%0A·%20𝗉𝗋𝗂𝖼𝖾%20:%20${encodeURIComponent(price)}%0A·%20𝗉𝖺𝗒𝗆𝖾𝗇𝗍%20:%20${encodeURIComponent(paymentMethod)}%0A%0A·%20𝗈𝗋𝖽𝖾𝗋%20𝗂𝖽%20:%20${encodeURIComponent(orderId)}%0A·%20𝗇𝗂𝖼𝗄𝗇𝖺𝗆𝖾%20:%20${encodeURIComponent(nick)}%0A·%20𝗎𝗌𝖾𝗋%20𝗂𝖽%20:%20${encodeURIComponent(uid)}%0A·%20𝗌𝖾𝗋𝗏𝖾𝗋%20𝗂𝖽%20:%20${encodeURIComponent(sid)}%0A·%20𝖼𝗈𝗇𝗍𝖺𝖼𝗍%20:%20${encodeURIComponent(nowa)}`;

    createPopup(
        'Konfirmasi Pembelian',
        `Pastikan semua data sudah benar:\n\n` +
        `Item: ${itemName}\nPrice: ${price}\nPayment: ${paymentMethod}\n\nNickname: ${nick}\nUser ID: ${uid}\nServer ID: ${sid}\n\n` +
        `Klik Confirm untuk lanjut ke WhatsApp.`,
        'confirm',
        waLink
    );
});

/* EFFECT */
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
addRippleEffect(document.querySelectorAll('.promo-item, .catalogue-category-button, .catalogue-item, .stars-btn'));

/* CHECK USERNAME */
const mlbbUidEl = document.getElementById('mlbbuid');
const mlbbSidEl = document.getElementById('mlbbsid');
const mlbbNickEl = document.getElementById('mlbbnick');

let useProxy = false;
let proxyBase = '';

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

async function doCheckMLBB() {
    const uid = mlbbUidEl.value.trim();
    const sid = mlbbSidEl.value.trim();
    if (!uid || !sid) {
        mlbbNickEl.innerHTML = '';
        return;
    }
    mlbbNickEl.innerHTML = 'Loading...';
    try {
        let url;
        if (useProxy && proxyBase) {
            url = `${proxyBase}?uid=${encodeURIComponent(uid)}&zone=${encodeURIComponent(sid)}`;
        } else if (useProxy && !proxyBase) {
            mlbbNickEl.innerHTML = '<div class="error">Proxy belum diatur pada script. Edit variabel <code>proxyBase</code>.</div>';
            return;
        } else {
            url = `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(uid)}&zone=${encodeURIComponent(sid)}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
            mlbbNickEl.innerHTML = `<div class="error" style="color:#F5B2B3">User ID tidak ditemukan.</div>`;
            return;
        }

        const json = await res.json();
        let nick = null;
        if (json?.nickname) nick = json.nickname;
        else if (json?.data?.nickname) nick = json.data.nickname;
        else if (json?.name) nick = json.name;
        else if (json?.nick) nick = json.nick;
        else if (json?.result && typeof json.result === 'string') nick = json.result;

        if (nick) {
            mlbbNickEl.innerHTML = `<div class="ok" style="color:#bababa">Selamat datang,<span style="color:#ffffff"> ${escapeHtml(nick)}</span><br><span style="color:#bababa">Pastikan beli sesuai dengan Region akunmu. Kesalahan Region/Akun ID tidak bisa direfund!</span></div>`;
        } else {
            mlbbNickEl.innerHTML = '<div class="error">Nickname tidak ditemukan pada response. Lihat konsol untuk detail.</div>';
            console.log('Full response JSON:', json);
        }
    } catch (err) {
        mlbbNickEl.innerHTML = `<div class="error">Gagal: ${escapeHtml(err.message)}<br/><small>Jika ini error CORS, gunakan proxy di server (lihat contoh di bawah) atau coba endpoint lain.</small></div>`;
        console.error(err);
    }
}

const debouncedCheckMLBB = debounce(doCheckMLBB, 700);

mlbbUidEl.addEventListener('input', debouncedCheckMLBB);
mlbbSidEl.addEventListener('input', debouncedCheckMLBB);

mlbbUidEl.addEventListener('paste', () => setTimeout(debouncedCheckMLBB, 50));
mlbbSidEl.addEventListener('paste', () => setTimeout(debouncedCheckMLBB, 50));

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[s]));
}