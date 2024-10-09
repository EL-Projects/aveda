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

// Обновление бейджа на всех страницах
function updateCartBadge() {
  const cartBadge = document.getElementById("cart-badge");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems > 0 ? totalItems : ""; // Скрыть бейдж, если корзина пуста
}

// Вызов функции для обновления бейджа при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  // Обновление бейджа при загрузке
  updateCartBadge();
});
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
    updateCartBadge();
    displayCartItems();
  }
}

// Уменьшение количества товара в корзине
function decreaseCartQuantity(uniqueId) {
  const cartItem = cart.find((item) => item.uniqueId === uniqueId);
  if (cartItem && cartItem.quantity > 1) {
    cartItem.quantity--;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    displayCartItems();
  }
}

// Удаление товара из корзины
function removeCartItem(uniqueId) {
  cart = cart.filter((item) => item.uniqueId !== uniqueId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
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
// Отображение товаров в корзине
function displayCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalContainer = document.getElementById("cart-total");

  cartItemsContainer.innerHTML = ""; // Очищаем контейнер
  cartTotalContainer.innerHTML = ""; // Также очищаем общую сумму

  // Если корзина пустая, можно добавить сообщение об этом
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Корзина пуста.</p>";
    return; // Завершаем выполнение функции, если корзина пуста
  }

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
    <div class="product-name-wrap">
      <span class="product-name">${product.name}</span>
      <span class="product-name-weight">${multiplierDisplayName}</span>
    </div>
    <div class="cart-item-actions">
      <button class="cart-remove-button" onclick="removeCartItem('${item.uniqueId}')">Remove</button>
      <span class="cart-button-wrapper">
        <button class="cart-calc-button" onclick="decreaseCartQuantity('${item.uniqueId}')">-</button>
        <span class="cart-calc-quantity">${item.quantity}</span>
        <button class="cart-calc-button" onclick="increaseCartQuantity('${item.uniqueId}')">+</button>
      </span>
      <span class="cart-calc-quantity">${item.price}€</span>
    </div>
  `;

    // Создаем общий контейнер для Subtotal, Total и кнопки
    const summaryContainer = document.createElement("div");
    summaryContainer.classList.add("summary-container"); // Добавьте класс для стилизации

    // Создаем контейнер для Subtotal и Total
    const totalContainer = document.createElement("div");
    totalContainer.classList.add("subtotal-total-container");

    // Главный текст
    const mainText = document.createElement("span");
    mainText.classList.add("main-text");
    mainText.textContent = "Order Summary"; // Основной текст

    // Подитог (Subtotal)
    const subtotalDiv = document.createElement("div"); // Новый div для Subtotal
    subtotalDiv.classList.add("subtotal-container"); // Класс для стилизации

    const subtotalSpan = document.createElement("span"); // Новый span для текста Subtotal
    subtotalSpan.classList.add("subtotal-span");
    subtotalSpan.textContent = "Subtotal: ";

    const subtotalValueSpan = document.createElement("span"); // Новый span для значения Subtotal
    subtotalValueSpan.classList.add("subtotal-value");
    subtotalValueSpan.textContent = `${itemTotal} €`;

    subtotalDiv.appendChild(subtotalSpan); // Добавляем текст Subtotal в div
    subtotalDiv.appendChild(subtotalValueSpan); // Добавляем значение Subtotal в div

    // Итог (Total)
    const totalDiv = document.createElement("div"); // Новый div для Total
    totalDiv.classList.add("total-container"); // Класс для стилизации

    const totalSpan = document.createElement("span"); // Новый span для текста Total
    totalSpan.classList.add("total-span");
    totalSpan.textContent = "Total: ";

    const totalValueSpan = document.createElement("span"); // Новый span для значения Total
    totalValueSpan.classList.add("total-value");
    totalValueSpan.textContent = `${total.toFixed(2)} €`;

    totalDiv.appendChild(totalSpan); // Добавляем текст Total в div
    totalDiv.appendChild(totalValueSpan); // Добавляем значение Total в div

    // Заглушка для иконки
    const iconPlaceholder = document.createElement("span");
    iconPlaceholder.classList.add("icon-placeholder");
    iconPlaceholder.innerHTML = '<i class="fa fa-shopping-cart"></i>'; // Здесь можно вставить любую иконку

    // Текст перед иконкой
    const iconTextPlaceholder = document.createElement("span");
    iconTextPlaceholder.classList.add("icon-text-placeholder");
    iconTextPlaceholder.textContent = "Ваш заказ"; // Текст перед иконкой

    // Добавляем элементы в контейнер Subtotal и Total
    totalContainer.appendChild(mainText);
    totalContainer.appendChild(subtotalDiv); // Добавляем новый div для Subtotal
    totalContainer.appendChild(totalDiv); // Добавляем новый div для Total
    totalContainer.appendChild(iconTextPlaceholder);
    totalContainer.appendChild(iconPlaceholder);

    // Создаем контейнер для кнопки оплаты
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // Кнопка оплаты
    const checkoutButton = document.createElement("button");
    checkoutButton.classList.add("checkout-button");
    checkoutButton.textContent = "Checkout";
    checkoutButton.addEventListener("click", handleCheckout); // Привязываем обработчик оплаты

    // Добавляем кнопку оплаты в контейнер кнопки
    buttonContainer.appendChild(checkoutButton);

    // Добавляем оба контейнера в общий контейнер
    summaryContainer.appendChild(totalContainer);
    summaryContainer.appendChild(buttonContainer);

    // Добавляем все элементы на страницу
    itemElement.appendChild(imageContainer);
    itemElement.appendChild(infoContainer);
    itemElement.appendChild(summaryContainer); // Добавляем общий контейнер

    // Добавляем информацию о продукте на страницу
    cartItemsContainer.appendChild(itemElement);
  });
  // Обновляем общую сумму для всех товаров в корзине
  const totalLabel = document.createElement("span");
  totalLabel.textContent = "Total: "; // Текст "Total"

  const totalValue = document.createElement("span");
  totalValue.textContent = `${total.toFixed(2)} €`; // Общая сумма

  // Добавляем итоговую сумму в контейнер
  cartTotalContainer.appendChild(totalLabel);
  cartTotalContainer.appendChild(totalValue);
}

// Очистка корзины
function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
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

  // document.getElementById("clear-cart").addEventListener("click", clearCart);

  // Обработчик события для кнопки "Оплатить"
  document.getElementById("checkout").addEventListener("click", handleCheckout);
  updateCartBadge();
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

  alert(`Price for pay: ${totalAmount.toFixed(2)} € Pay complete!`);

  // Очистка корзины после успешной оплаты
  clearCart();
  console.log("Корзина очищена."); // Добавьте отладочное сообщение
}
