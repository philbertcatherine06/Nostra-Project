// ==========================================
// Walmart - simple JavaScript
// 1. Close offer bar
// 2. Open / close mobile menu
// 3. Home page slider
// 4. Like (heart) buttons
// 5. Collections: search + filter
// 6. Newsletter and contact form
// ==========================================


// 1. Close the top offer bar
const offerBar = document.getElementById("offerBar");
const offerClose = document.getElementById("offerClose");

offerClose?.addEventListener("click", () => {
  offerBar.style.display = "none";
});


// 2. Mobile side menu
const menuToggle = document.getElementById("menuToggle");
const sideNavbar = document.getElementById("sideNavbar");
const sideNavbarClose = document.getElementById("sideNavbarClose");
const menuBackdrop = document.getElementById("menuBackdrop");

function openSideMenu() {
  sideNavbar?.classList.add("open");
  menuBackdrop?.classList.add("show");
}

function closeSideMenu() {
  sideNavbar?.classList.remove("open");
  menuBackdrop?.classList.remove("show");
}

menuToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  openSideMenu();
});

sideNavbarClose?.addEventListener("click", closeSideMenu);
menuBackdrop?.addEventListener("click", closeSideMenu);

sideNavbar?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeSideMenu);
});


// 3. Image slider (only on home page)
const sliderImages = document.getElementById("sliderImages");
const sliderLeft = document.getElementById("sliderLeft");
const sliderRight = document.getElementById("sliderRight");
let sliderPosition = 0; // 0, 100 or 200

function showSlide() {
  sliderImages.style.marginLeft = `-${sliderPosition}%`;
}

sliderRight?.addEventListener("click", () => {
  sliderPosition += 100;
  if (sliderPosition > 200) sliderPosition = 0;
  showSlide();
});

sliderLeft?.addEventListener("click", () => {
  sliderPosition = sliderPosition === 0 ? 200 : sliderPosition - 100;
  showSlide();
});


// 4. Add to cart + notification + cart panel
const cartCountBox = document.getElementById("cartCount");
const cartNotice = document.getElementById("cartNotice");
const cartPanel = document.getElementById("cartPanel");
const cartListBox = document.getElementById("cartList");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");

let cartList = [];
let cartNoticeTimer = null;

function isPageReload() {
  const navType = performance.getEntriesByType("navigation")[0];
  if (navType) return navType.type === "reload";
  return performance.navigation && performance.navigation.type === 1;
}

function clearSavedCart() {
  cartList = [];
  try {
    localStorage.removeItem("walmartCartList");
    localStorage.removeItem("walmartCart");
  } catch (error) {}
}

function loadCart() {
  try {
    cartList = JSON.parse(localStorage.getItem("walmartCartList")) || [];
  } catch (error) {
    cartList = [];
  }

  cartList = cartList
    .filter((item) => item && item.name)
    .map((item) => ({
      name: item.name,
      price: Number(item.price) || 0,
      qty: Number(item.qty) || 1
    }))
    .filter((item) => item.price > 0);
}

function getCartCount() {
  return cartList.reduce((count, item) => count + (Number(item.qty) || 0), 0);
}

function updateCartCount() {
  const count = getCartCount();

  if (!cartCountBox) return;

  cartCountBox.textContent = count;
  cartCountBox.classList.toggle("show", count > 0);
}

function saveCart() {
  try {
    localStorage.setItem("walmartCartList", JSON.stringify(cartList));
    localStorage.setItem("walmartCart", String(getCartCount()));
  } catch (error) {}

  updateCartCount();
}

function getItemFromButton(button) {
  let name = button.getAttribute("data-name");
  let price = Number(button.getAttribute("data-price")) || 0;
  const card = button.closest(".product, .new-arrival-box, .most-wanted-box");

  if (card) {
    const title = card.querySelector("h3");
    const priceText = card.querySelector("p");
    const img = card.querySelector("img");

    if (!name && title) name = title.textContent;
    if (!name && img) name = img.alt;
    if (!price && priceText?.textContent.includes("₹")) {
      price = Number(priceText.textContent.replace(/[^0-9]/g, "")) || 0;
    }
  }

  if (!name) name = "Item";

  return { name, price };
}

function renderCartPanel() {
  if (!cartListBox) return;

  let html = "";
  let total = 0;

  cartList.forEach((item, i) => {
    total += item.price * item.qty;
    html +=
      '<div class="cart-item">' +
        `<p class="cart-item-name">${item.name}</p>` +
        '<div class="cart-item-row">' +
          `<span>₹${item.price * item.qty}</span>` +
          '<div class="qty-box">' +
            `<button type="button" data-qty="minus" data-index="${i}">-</button>` +
            `<span>${item.qty}</span>` +
            `<button type="button" data-qty="plus" data-index="${i}">+</button>` +
          "</div>" +
        "</div>" +
      "</div>";
  });

  cartListBox.innerHTML = html;

  if (cartEmpty) {
    cartEmpty.classList.toggle("show", cartList.length === 0);
  }

  if (cartTotal) {
    cartTotal.textContent = cartList.length === 0 ? "" : `Total: ₹${total}`;
  }
}

function openCartPanel() {
  if (!cartPanel) return;
  cartPanel.classList.add("open");
  cartNotice?.classList.remove("show");
}

function closeCartPanel() {
  cartPanel?.classList.remove("open");
}

function addToCart(button) {
  const info = getItemFromButton(button);
  const existing = cartList.find((item) => item.name === info.name);

  if (existing) {
    existing.qty += 1;
  } else {
    cartList.push({ name: info.name, price: info.price, qty: 1 });
  }

  saveCart();
  renderCartPanel();

  if (!cartNotice) return;

  cartNotice.textContent = `${info.name} added to cart`;
  cartNotice.classList.add("show");
  clearTimeout(cartNoticeTimer);
  cartNoticeTimer = setTimeout(() => {
    cartNotice.classList.remove("show");
  }, 2500);
}

if (isPageReload()) {
  clearSavedCart();
} else {
  loadCart();
}

saveCart();
renderCartPanel();
cartNotice?.classList.remove("show");
closeCartPanel();

document.addEventListener("click", (event) => {
  const addBtn = event.target.closest(".add-cart");
  const qtyBtn = event.target.closest("[data-qty]");

  if (addBtn) {
    addToCart(addBtn);
    return;
  }

  if (qtyBtn) {
    const qtyIndex = Number(qtyBtn.getAttribute("data-index"));
    const qtyAction = qtyBtn.getAttribute("data-qty");

    if (qtyAction === "plus") {
      cartList[qtyIndex].qty += 1;
    } else {
      cartList[qtyIndex].qty -= 1;
      if (cartList[qtyIndex].qty < 1) {
        cartList.splice(qtyIndex, 1);
      }
    }

    saveCart();
    renderCartPanel();
    return;
  }

  if (event.target.closest("#cartBtn") || event.target.closest("#cartNotice")) {
    if (cartPanel?.classList.contains("open")) {
      closeCartPanel();
    } else {
      openCartPanel();
    }
    return;
  }

  if (event.target.closest("#cartPanelClose")) {
    closeCartPanel();
    return;
  }

  if (event.target.closest("#cartClear")) {
    cartList = [];
    saveCart();
    renderCartPanel();
    return;
  }

  if (!event.target.closest("#cartPanel")) {
    closeCartPanel();
  }
});


// 5. Heart / like button on Most Wanted products
document.querySelectorAll(".like-button").forEach((button) => {
  button.addEventListener("click", () => {
    button.src = button.src.includes("blackheart")
      ? "img/icons/redheart.png"
      : "img/icons/blackheart.png";
  });
});


// 6. Collections page: product list, search and filter
const productData = [
  { name: "Floral Summer Shirt", price: 220, image: "img/products/f1.jpg", tags: ["new", "blue", "summer"] },
  { name: "Summer Green", price: 260, image: "img/products/f2.jpg", tags: ["new", "green", "beach"] },
  { name: "Party Floral Shirt", price: 399, image: "img/products/f3.jpg", tags: ["old", "red", "party"] },
  { name: "Floral Summer Shirt", price: 399, image: "img/products/f4.jpg", tags: ["old", "white", "beach"] },
  { name: "Beach Shirt", price: 579, image: "img/products/f5.jpg", tags: ["old", "white", "beach"] },
  { name: "Shirt Party Red", price: 579, image: "img/products/f6.jpg", tags: ["old", "red", "party"] },
  { name: "Party Floral Shirt", price: 399, image: "img/products/f7.jpg", tags: ["old", "red", "party"] },
  { name: "Shirt Party Red", price: 579, image: "img/products/f8.jpg", tags: ["old", "red", "party"] },
  { name: "Floral Summer Shirt", price: 220, image: "img/products/f1.jpg", tags: ["new", "blue", "summer"] }
];

const productsBox = document.getElementById("products");
const noProducts = document.getElementById("noProducts");
const resultCount = document.getElementById("resultCount");
const clearFiltersBtn = document.getElementById("clearFilters");

function getCheckedValues(groupName) {
  return [...document.getElementsByName(groupName)]
    .filter((box) => box.checked)
    .map((box) => box.value);
}

function hasAnyTag(item, selected) {
  if (selected.length === 0) return true;
  return selected.some((tag) => item.tags.includes(tag));
}

function matchesPrice(item, selected) {
  if (selected.length === 0) return true;

  return selected.some((range) => {
    if (range === "under300") return item.price < 300;
    if (range === "300to500") return item.price >= 300 && item.price <= 500;
    if (range === "above500") return item.price > 500;
    return false;
  });
}

function showProducts(list) {
  productsBox.innerHTML = "";

  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML =
      `<img src="${item.image}" alt="${item.name}">` +
      `<h3>${item.name}</h3>` +
      `<p>₹${item.price}</p>` +
      `<button type="button" class="add-cart" data-name="${item.name}" data-price="${item.price}">Add to cart</button>`;
    productsBox.appendChild(card);
  });

  if (resultCount) {
    resultCount.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
  }

  if (noProducts) {
    noProducts.classList.toggle("show", list.length === 0);
  }
}

function updateProducts() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const occasion = getCheckedValues("occasion");
  const color = getCheckedValues("color");
  const arrival = getCheckedValues("arrival");
  const price = getCheckedValues("price");

  const result = productData.filter((item) => {
    const nameMatch =
      item.name.toLowerCase().includes(searchText) ||
      item.tags.join(" ").includes(searchText);

    return (
      nameMatch &&
      matchesPrice(item, price) &&
      hasAnyTag(item, occasion) &&
      hasAnyTag(item, color) &&
      hasAnyTag(item, arrival)
    );
  });

  showProducts(result);
}

if (productsBox) {
  showProducts(productData);

  const searchInput = document.getElementById("searchInput");
  const allFilterBoxes = document.querySelectorAll(".filter-section input[type='checkbox']");

  searchInput.addEventListener("input", updateProducts);
  allFilterBoxes.forEach((box) => box.addEventListener("change", updateProducts));

  clearFiltersBtn?.addEventListener("click", () => {
    searchInput.value = "";
    allFilterBoxes.forEach((box) => {
      box.checked = false;
    });
    updateProducts();
  });
}


// 7. Newsletter form (required message under the input)
const newsForm = document.getElementById("newsForm");
const newsEmail = document.getElementById("newsEmail");
const newsEmailError = document.getElementById("newsEmailError");

function getNewsEmailError() {
  const email = newsEmail.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") return "Email is required.";
  if (!emailPattern.test(email)) {
    return "Please enter a valid email, for example name@example.com.";
  }
  return "";
}

function showNewsEmailError() {
  if (!newsEmailError) return getNewsEmailError() === "";

  const message = getNewsEmailError();
  newsEmailError.textContent = message;
  newsEmail.classList.toggle("invalid", message !== "");
  return message === "";
}

if (newsForm) {
  newsEmail.addEventListener("input", showNewsEmailError);

  newsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!showNewsEmailError()) return;

    alert("Thanks for subscribing!");
    newsForm.reset();
    newsEmail.classList.remove("invalid");
    newsEmailError.textContent = "";
  });
}


// Contact form (same idea as the Smart Registration Form)
const contactForm = document.getElementById("contactForm");
const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactMessage = document.getElementById("contactMessage");
const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const messageError = document.getElementById("messageError");
const successPopup = document.getElementById("successPopup");
const popupTitle = document.getElementById("popupTitle");
const popupText = document.getElementById("popupText");
const closePopupBtn = document.getElementById("closePopup");

function getContactNameError() {
  if (contactName.value.trim() === "") {
    return "Name is required. Please enter your name.";
  }
  return "";
}

function getContactEmailError() {
  const email = contactEmail.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (email === "") return "Email is required.";
  if (!emailPattern.test(email)) {
    return "Please enter a valid email, for example name@example.com.";
  }
  return "";
}

function getContactMessageError() {
  if (contactMessage.value.trim() === "") {
    return "Message is required. Please write your message.";
  }
  return "";
}

function showFieldMessage(input, errorElement, message) {
  errorElement.textContent = message;
  input.classList.toggle("invalid", message !== "");
  return message === "";
}

function checkContactName() {
  return showFieldMessage(contactName, nameError, getContactNameError());
}

function checkContactEmail() {
  return showFieldMessage(contactEmail, emailError, getContactEmailError());
}

function checkContactMessage() {
  return showFieldMessage(contactMessage, messageError, getContactMessageError());
}

if (contactForm) {
  contactName.addEventListener("input", checkContactName);
  contactEmail.addEventListener("input", checkContactEmail);
  contactMessage.addEventListener("input", checkContactMessage);

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameOk = checkContactName();
    const emailOk = checkContactEmail();
    const messageOk = checkContactMessage();
    document.getElementById("contactMessageText").textContent = "";

    if (!nameOk || !emailOk || !messageOk) return;

    const userName = contactName.value.trim();
    popupTitle.textContent = "Message sent";
    popupText.textContent = `Thank you, ${userName}! We will contact you soon.`;
    successPopup.classList.add("show");

    contactForm.reset();
    contactName.classList.remove("invalid");
    contactEmail.classList.remove("invalid");
    contactMessage.classList.remove("invalid");
    nameError.textContent = "";
    emailError.textContent = "";
    messageError.textContent = "";
  });
}

closePopupBtn?.addEventListener("click", () => {
  successPopup.classList.remove("show");
});

successPopup?.addEventListener("click", (event) => {
  if (event.target === successPopup) {
    successPopup.classList.remove("show");
  }
});
