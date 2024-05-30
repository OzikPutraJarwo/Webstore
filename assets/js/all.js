// CART & PRODUCT : Pengaturan mata uang
function currency(e) {
    const curr = "Rp ";
    const locs = "id-ID";
    return `${curr}${e.toLocaleString(locs)}`;
}

// CART : Tambah jumlah item
function increaseAmount(event) {
    updateCartItem(event, 1);
}

// CART : Kurangi jumlah item
function decreaseAmount(event) {
    updateCartItem(event, -1);
}

// CART : Mengupdate jumlah item
function updateCartItem(event, delta) {
    const itemElement = event.target.closest('.cart-item');
    const index = Array.from(itemElement.parentElement.children).indexOf(itemElement);
    const cart = getCartFromLocalStorage();
    if (cart[index].amount + delta > 0) {
        cart[index].amount += delta;
        updateLocalStorage(cart);
        renderCart();
    }
}

// CART : Hapus item
function removeItem(event) {
    const itemElement = event.target.closest('.cart-item');
    const index = Array.from(itemElement.parentElement.children).indexOf(itemElement);
    const cart = getCartFromLocalStorage();
    cart.splice(index, 1);
    updateLocalStorage(cart);
    renderCart();
}

// CART : Memperbarui localStorage
function updateLocalStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// CART : Mengambil localStorage
function getCartFromLocalStorage() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// CART : Render
function renderCart() {
    const cart = getCartFromLocalStorage();
    const cartWrapper = document.querySelector('.cart-container .wrapper');
    cartWrapper.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-index="${index}">
            <img src="${item.image}" class="cart-image"/>
            <p class="cart-title">${item.title}</p>
            <div class="cart-amount">
                <span class="minus" data-index="${index}">-</span>
                <span class="value">${item.amount}</span>
                <span class="plus" data-index="${index}">+</span>
            </div>
            <p class="cart-weight">${item.weight}</p>
            <p class="cart-price" price="${item.price * item.amount}">${currency(item.price * item.amount)}</p>
            <button class="remove" data-index="${index}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
                    <path d="M242.7 256l100.1-100.1c12.3-12.3 12.3-32.2 0-44.5l-22.2-22.2c-12.3-12.3-32.2-12.3-44.5 0L176 189.3 75.9 89.2c-12.3-12.3-32.2-12.3-44.5 0L9.2 111.5c-12.3 12.3-12.3 32.2 0 44.5L109.3 256 9.2 356.1c-12.3 12.3-12.3 32.2 0 44.5l22.2 22.2c12.3 12.3 32.2 12.3 44.5 0L176 322.7l100.1 100.1c12.3 12.3 32.2 12.3 44.5 0l22.2-22.2c12.3-12.3 12.3-32.2 0-44.5L242.7 256z"/>
                </svg>
            </button>
        </div>
    `).join('');
    cartamountEventListeners();
}

// CART : Event listener untuk cart-amount
function cartamountEventListeners() {
    document.querySelectorAll('.cart-amount .plus').forEach(button => {
        button.addEventListener('click', increaseAmount);
    });
    document.querySelectorAll('.cart-amount .minus').forEach(button => {
        button.addEventListener('click', decreaseAmount);
    });
    document.querySelectorAll('.remove').forEach(button => {
        button.addEventListener('click', removeItem);
    });
}

// CART : Hapus semua item
function removeAllItems() {
    document.body.classList.remove("ov");
    localStorage.removeItem('cart');
    renderCart();
}
document.querySelector('.cart-container .items-wrap .remove-all p').addEventListener('click', removeAllItems);

// CART : Perbarui harga setiap klik
document.querySelectorAll('.cart-container .items-wrap .cart-item').forEach(item => {
    item.addEventListener('click', calculateTotalPriceAndItem);
});

// CART : Tombol di header
const cartButton = document.querySelector("header .cart");
const cartContainer = document.querySelector(".cart-container");
cartButton.addEventListener("click", () => {
    cartContainer.classList.toggle("show");
    document.body.classList.toggle("ov");
    cartButton.classList.toggle("show");
    if (document.querySelector("header .cart .item-count").textContent == 0){
        document.body.classList.remove("ov");
    }
});

// CART : Render saat DOMContentLoaded
document.addEventListener('DOMContentLoaded', renderCart);

// CART : Hitung total harga, total item, dan jumlah produk
function calculateTotalPriceAndItem() {
    // Total harga
    const cartPriceElements = document.querySelectorAll('.cart-container .cart-item .cart-price');
    let totalPrice = Array.from(cartPriceElements).reduce((sum, priceElement) => sum + parseInt(priceElement.getAttribute("price")), 0);
    const totalPriceElement = document.querySelector('.cart-container .payment-wrap .total .desc .price-total');
    totalPriceElement.textContent = currency(totalPrice);
    const headerPriceElement = document.querySelector('header .cart .desc .price');
    headerPriceElement.setAttribute("price", totalPrice);
    headerPriceElement.textContent = totalPrice ? currency(totalPrice) : "Kosong";
    // Total item
    const cartAmountElements = document.querySelectorAll('.cart-container .cart-item .cart-amount .value');
    let totalItem = Array.from(cartAmountElements).reduce((sum, amountElement) => sum + parseInt(amountElement.textContent), 0);
    document.querySelector('.cart-container .payment-wrap .summary .item-total .count').textContent = totalItem;
    document.querySelector('header .cart .item-count').textContent = totalItem;
    // Jumlah produk
    const productCountLength = document.querySelectorAll('.cart-container .items-wrap .cart-item').length;
    const productCountElement = document.querySelector('.cart-container .items-wrap .title-wrap .item-count span');
    productCountElement.textContent = productCountLength || "Tidak ada ";
    document.querySelector(".cart-container").classList.toggle("empty", productCountLength === 0);
    // Animasi pop
    const headerCart = document.querySelector('header .cart');
    headerCart.classList.add('pop');
    setTimeout(() => headerCart.classList.remove('pop'), 100);
}

// CART : calculateTotalPriceAndItem setiap DOMSubtreeModified
document.querySelector('.cart-container .items-wrap').addEventListener('DOMSubtreeModified', calculateTotalPriceAndItem);

// CART : Memanggil calculateTotalPriceAndItem() saat pertama kali dimuat
calculateTotalPriceAndItem();