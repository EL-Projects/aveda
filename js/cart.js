// Массив товаров, которые можно добавить в корзину
const products = [
  { id: 1, name: "Товар 1", price: 19.99, image: "images/image1.png" },
  {
    id: 2,
    name: "Eco Soap",
    price: 19.99,
    image: "images/image2.png",
    multipliers: [
      { displayName: "50 g", value: 1 },
      { displayName: "90 g", value: 2 },
    ],
  },
  { id: 3, name: "Товар 3", price: 300, image: "images/image3.png" },
];

// Инициализация корзины
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let quantities = {
  1: 1,
  2: 1,
  3: 1,
};

// Обновление бейджа на главной странице
function updateCartBadge() {
  const cartBadge = document.getElementById("cart-badge");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
}

// Добавление товара в корзину
function addToCart(id, price, multiplier) {
  // Создаём уникальный идентификатор для товара в корзине
  const uniqueId = `${id}-${multiplier}`;
  const existingItem = cart.find((item) => item.uniqueId === uniqueId);
  const quantity = quantities[id];

  if (existingItem) {
    existingItem.quantity += quantity; // Увеличиваем количество существующего товара
  } else {
    cart.push({
      uniqueId: uniqueId, // Уникальный идентификатор
      id: id,
      price: (price * multiplier).toFixed(2), // Убедитесь, что цена корректно вычисляется
      quantity: quantity,
      multiplier,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();

  // Сбрасываем количество товара после добавления в корзину
  quantities[id] = 1;
  document.getElementById(`quantity-${id}`).textContent = quantities[id]; // Обновляем отображение количества
  updatePrice(id); // Обновляем итоговую цену
}

// Увеличение количества товара на главной странице
function increaseQuantity(id) {
  quantities[id]++;
  document.getElementById(`quantity-${id}`).textContent = quantities[id];
  updatePrice(id); // Обновляем итоговую цену
}

// Уменьшение количества товара на главной странице
function decreaseQuantity(id) {
  if (quantities[id] > 1) {
    quantities[id]--;
    document.getElementById(`quantity-${id}`).textContent = quantities[id];
    updatePrice(id); // Обновляем итоговую цену
  }
}

// Увеличение количества товара в корзине
function increaseCartQuantity(uniqueId) {
  const cartItem = cart.find((item) => item.uniqueId === uniqueId);
  if (cartItem) {
    cartItem.quantity++;
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCartItems();
  }
}

// Уменьшение количества товара в корзине
function decreaseCartQuantity(uniqueId) {
  const cartItem = cart.find((item) => item.uniqueId === uniqueId);
  if (cartItem && cartItem.quantity > 1) {
    cartItem.quantity--;
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCartItems();
  }
}

// Удаление товара из корзины
function removeCartItem(uniqueId) {
  cart = cart.filter((item) => item.uniqueId !== uniqueId);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCartItems();
}

// Обновление итоговой цены товара на главной странице
function updatePrice(id) {
  const basePrice = parseFloat(
    document
      .querySelector(`.product button[data-id="${id}"]`)
      .getAttribute("data-price")
  );
  const multiplier = getMultiplier(id);
  const totalPrice = (basePrice * multiplier * quantities[id]).toFixed(2);
  document.getElementById(`total-price-${id}`).textContent = `${totalPrice} €`;
}

// Получение множителя для каждого товара
function getMultiplier(id) {
  const multiplierInputs = document.querySelectorAll(
    `input[name="multiplier-${id}"]`
  );
  for (const input of multiplierInputs) {
    if (input.checked) {
      return parseFloat(input.value); // Используем parseFloat
    }
  }
  return 1;
}

// Обновление отображаемой начальной цены при выборе множителя
function updateDisplayedPrice(id) {
  const basePrice = products.find((p) => p.id === id).price; // Получаем базовую цену из массива продуктов
  const multiplier = getMultiplier(id);
  const newPrice = (basePrice * multiplier).toFixed(2); // Вычисляем новую начальную цену
  document.getElementById(`base-price-${id}`).textContent = `${newPrice} €`; // Обновляем отображение начальной цены

  // Сбрасываем количество товара в 1 при смене множителя
  quantities[id] = 1;
  document.getElementById(`quantity-${id}`).textContent = quantities[id]; // Обновляем отображение количества
  updatePrice(id); // Обновляем итоговую цену
}

// Отображение товаров в корзине
function displayCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalContainer = document.getElementById("cart-total");

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id); // Получаем информацию о продукте
    const itemTotal = (item.price * item.quantity).toFixed(2);
    total += parseFloat(itemTotal); // Корректное сложение

    const itemElement = document.createElement("div");
    itemElement.classList.add("cart-item");

    // Создаем контейнер для изображения
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("cart-item-image-container");
    imageContainer.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="cart-item-image">
    `;

    // Создаем контейнер для информации
    const infoContainer = document.createElement("div");
    infoContainer.classList.add("cart-item-info");
    const multiplierDisplayName = product.multipliers
      ? product.multipliers.find((m) => m.value === item.multiplier).displayName
      : "Без множителя";

    infoContainer.innerHTML = `
      <span>${product.name}</span>
      <span>${multiplierDisplayName}</span>
      <div class="cart-item-actions">
        <button onclick="removeCartItem('${item.uniqueId}')">Удалить</button>
        <button onclick="decreaseCartQuantity('${item.uniqueId}')">-</button>
        <span>${item.quantity}</span>
        <button onclick="increaseCartQuantity('${item.uniqueId}')">+</button>
      </div>
    `;

    // Создаем отдельные элементы для отображения цены и подитога
    const priceElement = document.createElement("span");
    priceElement.textContent = `${item.price} €`; // Цена товара

    const subtotalLabel = document.createElement("span");
    subtotalLabel.textContent = "Subtotal: "; // Текст "Subtotal"

    const subtotalValue = document.createElement("span");
    subtotalValue.textContent = `${itemTotal} €`; // Подитог

    // Добавляем элементы для цены и подитога в контейнер
    infoContainer.appendChild(priceElement);
    infoContainer.appendChild(subtotalLabel);
    infoContainer.appendChild(subtotalValue);

    // Добавляем оба контейнера на страницу
    cartItemsContainer.appendChild(imageContainer);
    cartItemsContainer.appendChild(infoContainer);
  });

  // Создание отдельного элемента для Total
  cartTotalContainer.innerHTML = ""; // Очищаем контейнер перед добавлением новых элементов

  const totalLabel = document.createElement("span");
  totalLabel.textContent = "Total: "; // Текст "Total"

  const totalValue = document.createElement("span");
  totalValue.textContent = `${total.toFixed(2)} €`; // Сумма

  // Добавляем элементы для Total в контейнер
  cartTotalContainer.appendChild(totalLabel);
  cartTotalContainer.appendChild(totalValue);
}

// Очистка корзины
function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCartItems();
}

// События на главной странице
if (document.querySelector(".products")) {
  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("click", function () {
      const id = parseInt(this.getAttribute("data-id"));
      const price = parseFloat(this.getAttribute("data-price")); // Используем parseFloat
      const multiplier = getMultiplier(id);
      if (quantities[id] > 0) {
        // Проверка на 0 или отрицательное значение
        addToCart(id, price, multiplier);
      } else {
        alert("Количество товара не может быть 0 или отрицательным.");
      }
    });
  });

  // Инициализация бейджа и цен при загрузке
  updateCartBadge();
  products.forEach((product) => {
    updatePrice(product.id); // Обновляем итоговые цены
  });
}

// События на странице корзины
if (document.querySelector("#cart-items")) {
  displayCartItems();

  document.getElementById("clear-cart").addEventListener("click", clearCart);

  // Обработчик события для кнопки "Оплатить"
  document.getElementById("checkout").addEventListener("click", handleCheckout);
}

// Функция обработки оплаты
function handleCheckout() {
  if (cart.length === 0) {
    alert("Ваша корзина пуста! Добавьте товары для оплаты.");
    return;
  }

  const totalAmount = cart.reduce(
    (total, item) => total + parseFloat(item.price) * item.quantity,
    0
  );

  // Здесь вы можете интегрировать платёжный шлюз или систему оплаты
  alert(`Сумма к оплате: ${totalAmount.toFixed(2)} € Pay complete!`);

  // Очистка корзины после успешной оплаты
  clearCart();
}

// Установка слушателя событий на радио-кнопки
document.querySelectorAll('input[type="radio"]').forEach((input) => {
  input.addEventListener("change", (event) => {
    const id = event.target.name.split("-")[1]; // Получаем id из имени
    updatePrice(id); // Обновляем цену для данного товара
  });
});
