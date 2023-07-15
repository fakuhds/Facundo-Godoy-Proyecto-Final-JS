//Simulacion de base de datos
class BaseDeDatos {
  constructor() {
    this.productos = [];
    
  }



  //Asincronia
  async bringRegisters() {
    const response = await fetch("./products.json");
    this.productos = await response.json();
    return this.productos;
  }

  registerById(id) {
    return this.productos.find((product) => product.id == id);
  }

  registerByName(word) {
    return this.productos.filter((product) =>
      product.name.toLowerCase().includes(word)
    );
  }
  registerByCategory(keyword) {
    return this.productos.filter((product) => product.category.includes(keyword));
  }
}

//Clase Carrito
class Cart {
  constructor() {
    const storageCart = JSON.parse(localStorage.getItem("cart"));
    this.cart = storageCart || [];
    this.total = 0;
    this.totalProducts = 0;
    this.list();
  }

  inCart({ id }) {
    return this.cart.find((product) => product.id === id);
  }

  addToCart(product) {
    let productOnCart = this.inCart(product);
    if (productOnCart) {
      productOnCart.amount++;
    } else {
      this.cart.push({ ...product, amount: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(this.cart));
    this.list();
    Toastify({
      text: `${product.name} Agregado al carrito`,
      duration: 2000,
      className: "info",
      gravity: "bottom",
      position: "center",
      style: {
        background: "black",
      },
    }).showToast();
  }

  remove(id) {
    const index = this.cart.findIndex((product) => product.id === id);
    const productName = this.cart[index].name;
    if (this.cart[index].amount > 1) {
      this.cart[index].amount--;
    } else {
      this.cart.splice(index, 1);
      Toastify({
        text: `${productName} Eliminado del carrito`,
        duration: 2000,
        className: "info",
        gravity: "bottom",
        position: "right",
        style: {
          background: "black",
        },
      }).showToast();
    }
    localStorage.setItem("cart", JSON.stringify(this.cart));
    this.list();
  }

  add(id) {
    const index = this.cart.findIndex((product) => product.id === id);
    if (this.cart[index].amount >= 1) {
      this.cart[index].amount++;
    }
    localStorage.setItem("cart", JSON.stringify(this.cart));
    this.list();
  }

  list() {
    this.total = 0;
    this.totalProducts = 0;
    cartDiv.innerHTML = "";
    for (const product of this.cart) {
      cartDiv.innerHTML += `
      <ul class="cart list-group">
      <li class="list-group-item">
      <div class="row">
        <div class="col">
          <div class="mt-2">Producto:</div>
          <div class="mt-2">${product.name}</div>
          <div class="mt-2">Precio: ${product.price} Pesos $</div>
          <div class="mt-2">Color: ${product.color}</div>
          <a class="mt-1 mx-1 btn btn-sm btn-outline-dark border-1 py-1 removeBtn" href="#" data-id="${product.id}"><i class="bi bi-dash-lg"></i></a><a class="mt-1 mx-1 btn border-1 py-1" href="#">${product.amount}</a><a class="mt-1 mx-1 btn btn-sm btn-outline-dark border-1 py-1 addBtn" href="#" data-id="${product.id}"><i class="bi bi-plus-lg"></i></a>
        </div>
        <div class="col">
          <img src="${product.image}" class="img-fluid cart-img">
        </div>
      </div>
    </li>
    </ul>`;
      this.total += product.price * product.amount;
      this.totalProducts += product.amount;
    }
    //Botones Quitar
    const removeButtons = document.querySelectorAll(".removeBtn");
    for (const button of removeButtons) {
      button.onclick = (event) => {
        event.preventDefault();
        this.remove(Number(button.dataset.id));
      };
    }
    //Botones Agregar
    const addButtons = document.querySelectorAll(".addBtn");
    for (const button of addButtons) {
      button.onclick = (event) => {
        event.preventDefault();
        this.add(Number(button.dataset.id));
      };
    }
    //Actualizar Carrito
    spanProductsOnCart.innerText = this.totalProducts;
    spanCartTotl.innerText = this.total;
  }

  //Vaciar Carrito
  emptyCart() {
    this.cart = [];
    localStorage.removeItem("cart");
    this.total = 0;
    this.totalProducts = 0;
    cartDiv.innerHTML = "";

    
    spanProductsOnCart.innerText = this.totalProducts;
    spanCartTotl.innerText = this.total;
  }


}

//Clase Producto
class Product {
  constructor(id, name, price, color, image = fasle, category) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.color = color;
    this.image = image;
    this.category = category;
  }
}

//Inicializacion de Base de datos
const DB = new BaseDeDatos();


//Elementos
const productsDiv = document.querySelector("#products");
const cartDiv = document.querySelector("#cart");
const spanProductsOnCart = document.querySelector("#productsOnCart");
const spanCartTotl = document.querySelector("#cartTotal");
const searchInput = document.querySelector("#searchInput");
const emptyCartButton = document.querySelector("#emptyCartBtn");
const bannerTop = document.querySelector("#bannerTop");
const newCategory = document.querySelector("#newCategory");
const iframe = document.querySelector("#iframe");






//Llamada a la Base de datos
DB.bringRegisters().then((products) => loadProducts(products));

//Agregamos al HTML los registros de la BD
function loadProducts(products) {
  productsDiv.innerHTML = "";
  for (const product of products) {
    productsDiv.innerHTML += `
    <div class="p-1 col-sm-6 col-md-3 col-lg-2 d-inline-block m-2 text-center card text-center">
              <img
                src="${product.image}"
                class="img-fluid card-img-top"
                alt="evade pro base ls jersey brown"
              />
              <div class="card-body">
                <button
                  class="addToCartBtn btn btn-dark"
                  data-id="${product.id}"
                >
                  Agregar al Carrito
                </button>
              </div>
            </div>
    `;
  }
  //Botones Agregar al carrito
  const addToCartButtons = document.querySelectorAll(".addToCartBtn");
  for (const button of addToCartButtons) {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const id = Number(button.dataset.id);
      const product = DB.registerById(id);
      cart.addToCart(product);
    });
  }
}

//Evento Buscar
searchInput.addEventListener("keyup", (event) => {
  event.preventDefault();
  const word = searchInput.value;
  loadProducts(DB.registerByName(word.toLowerCase()));
  bannerTop.innerHTML = "";
  iframe.classList.add("d-none");
});

;







//Vaciar Carrito
emptyCartButton.addEventListener("click", () => {
  cart.emptyCart();
});

//Objeto Carrito
const cart = new Cart();

//Boton Subir
const scrollUpButton = document.getElementById("scrollUp");

scrollUpButton.addEventListener("click", () => {
  
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

