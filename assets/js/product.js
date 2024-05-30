// Ambil semua produk/item
const items = document.querySelectorAll('#product-wrapper .item');

// Menambahkan item ke cart
function addToCart(event) {
    const itemElement = event.target.closest('.item');
    const weight = itemElement.getAttribute("weight-type");
    const image = itemElement.querySelector('.image').src;
    const title = itemElement.querySelector('.title').textContent;
    const priceElement = itemElement.querySelector('.price');
    const price = parseFloat(priceElement.querySelector('.discounted') ? priceElement.getAttribute("discount") : priceElement.getAttribute("value"));
    const amount = parseInt(itemElement.querySelector('.actions .amount .value').textContent);
    let cart = getCartFromLocalStorage();
    
    // Check if the item already exists in the cart
    const existingItemIndex = cart.findIndex(item => item.title === title);
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].amount += amount;
    } else {
        cart.push({ weight, image, title, price, amount });
    }

    updateLocalStorage(cart);
    renderCart();

    // Add a pop animation to the cart icon
    const headerCart = document.querySelector('header .cart');
    headerCart.classList.add('pop');
    setTimeout(() => headerCart.classList.remove('pop'), 100);
}

// Event listener for adding items to the cart
document.addEventListener('click', (event) => {
    if (event.target.closest('#product-wrapper .add-to-cart')) {
        const itemWrapper = event.target.closest('.item');
        const successAction = itemWrapper.querySelector('.success');
        const amountValue = itemWrapper.querySelector('.actions .amount .value');
        
        // Show success message and reset amount
        [itemWrapper, successAction].forEach(el => el?.classList.add('show'));
        amountValue.textContent = '1';

        setTimeout(() => itemWrapper.classList.remove('show'), 1000);
        setTimeout(() => successAction.classList.remove('show'), 2000);
    }
});

// Looping melalui setiap item untuk inisialisasi
items.forEach(item => {
    // Mendapatkan informasi produk
    const weight = item.getAttribute("weight-type");
    const category = item.querySelector('.category').textContent.toLowerCase();
    const title = item.querySelector('.title').textContent;
    const priceElement = item.querySelector('.price');
    const price = parseFloat(priceElement.textContent);
    const discount = item.querySelector('.discount');

    // Update attributes for category and price
    item.querySelector('.category').setAttribute('value', category);
    priceElement.setAttribute('value', price.toString());

    // Jika ada diskon, hitung harga diskon dan perbarui elemen HTML
    if (discount) {
        const discountAmount = parseFloat(discount.textContent.replace('-', '').replace('%', ''));
        const discountedPrice = price - (price * (discountAmount / 100));
        priceElement.innerHTML = `
            <span price="${price}">${currency(price)}</span>
            <span class="discounted" price="${discountedPrice}">${currency(discountedPrice)}<sub>/${weight}</sub></span>`;
        priceElement.setAttribute('discount', discountedPrice.toString());
    } else {
        priceElement.innerHTML = `<span price="${price}">${currency(price)}<sub>/${weight}</sub></span>`;
    }

    // Menambahkan amount & add to cart
    item.innerHTML += `
    <div class="actions-wrap">
        <div class="actions">
            <div class="success">Sukses!</div>
            <div class="amount">
                <span class="minus">-</span>
                <span class="value">1</span>
                <span class="plus">+</span>
            </div>
            <div class="add-to-cart"><svg viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M0 26.016q0 2.496 1.76 4.224t4.256 1.76h20q2.464 0 4.224-1.76t1.76-4.224v-20q0-2.496-1.76-4.256t-4.224-1.76h-20q-2.496 0-4.256 1.76t-1.76 4.256v4h4v-4q0-0.832 0.576-1.408t1.44-0.608h20q0.8 0 1.408 0.608t0.576 1.408v20q0 0.832-0.576 1.408t-1.408 0.576h-20q-0.832 0-1.44-0.576t-0.576-1.408v-4h-4v4zM0 18.016h8v4l8-6.016-8-5.984v4h-8v4z"></path></svg></div>
        </div>
    </div>`;

    // Fungsi tambah dan kurangi amount
    let getAmount = 1;  // Inisialisasi jumlah default 1
    const amountElement = item.querySelector('.actions .amount .value');
    const plusAmount = item.querySelector('.actions .amount .plus');
    const minusAmount = item.querySelector('.actions .amount .minus');

    plusAmount.addEventListener("click", () => {
        getAmount++;
        amountElement.textContent = getAmount;
    });

    minusAmount.addEventListener("click", () => {
        if (getAmount > 1) {
            getAmount--;
            amountElement.textContent = getAmount;
        }
    });

    // Tambahkan event listener untuk tombol add to cart
    item.querySelector('.add-to-cart').addEventListener('click', addToCart);

    // Toggle class 'show' saat item diklik di luar area actions
    item.addEventListener("click", (event) => {
        if (!event.target.closest(".actions")) {
            item.classList.toggle("show");
        }
    });
});

// Dapatkan elemen-elemen yang dibutuhkan
const addtoCartFirst = document.querySelectorAll('#product-wrapper .add-to-cart');
const cartIcon = document.querySelector('header .cart');

// Fungsi untuk menjalankan animasi
function flyToCart(e) {
  // Buat elemen div merah dengan ukuran 40x40 px
  const flyingItem = document.createElement('div');
  flyingItem.classList.add('flying-item');
  flyingItem.style.width = '40px';
  flyingItem.style.height = '40px';
  flyingItem.style.backgroundColor = 'red';
  flyingItem.style.opacity = '1';
  flyingItem.style.position = 'fixed';
  flyingItem.style.zIndex = '9999';

  // Dapatkan posisi awal elemen yang diklik
  const itemRect = e.target.getBoundingClientRect();
  flyingItem.style.left = itemRect.left + 'px';
  flyingItem.style.top = itemRect.top + 'px';

  // Tambahkan elemen ke dokumen
  document.body.appendChild(flyingItem);

  // Animasi terbang ke icon keranjang
  const cartRect = cartIcon.getBoundingClientRect();
  const distance = Math.sqrt(Math.pow(cartRect.left - itemRect.left, 2) + Math.pow(cartRect.top - itemRect.top, 2));
  const duration = 1000; // Durasi animasi 1 detik

  flyingItem.animate([
    { transform: 'translate(0, 0)', opacity: '1' },
    { transform: `translate(${cartRect.left - itemRect.left}px, ${cartRect.top - itemRect.top}px)`, opacity: '0' }
  ], {
    duration: duration,
    easing: 'ease-in-out',
    fill: 'forwards'
  }).onfinish = () => {
    // Hapus elemen div setelah animasi selesai
    flyingItem.remove();
  };
}

// Tambahkan event listener pada setiap elemen dengan kelas ".add-to-cart"
addtoCartFirst.forEach(item => {
  item.addEventListener('click', flyToCart);
});