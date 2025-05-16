import { getLocalStorage, setLocalStorage, getDiscount } from "./utils.mjs";


export default class ProductDetails {
    constructor(productId, dataSource) {
        this.productId = productId;
        this.product = {};
        this.dataSource = dataSource;
    }

    async init() {
        this.product = await this.dataSource.findProductById(this.productId);
        this.renderProductDetails()
        document
            .getElementById("addToCart")
            .addEventListener("click", this.addProductToCart.bind(this));
    }

    addProductToCart() {
        const cartItems = getLocalStorage("so-cart") || [];
        cartItems.push(this.product);
        setLocalStorage("so-cart", cartItems);
    }


    renderProductDetails() {
        productDetailsHTML(this.product);
    }
}

/**
 * Updates the product details section of the page with the provided product information.
 *
 * @param {Object} product - The product object containing details to display.
 * @param {Object} product.Brand - The brand information of the product.
 * @param {string} product.Brand.Name - The name of the product's brand.
 * @param {string} product.NameWithoutBrand - The product name without the brand.
 * @param {string} product.Image - The URL of the product image.
 * @param {string} product.SuggestedRetailPrice - The suggested retail price of the product.
 * @param {string} product.FinalPrice - The final price of the product.
 * @param {Array<Object>} product.Colors - Array of color objects for the product.
 * @param {string} product.Colors[].ColorName - The name of the color.
 * @param {string} product.DescriptionHtmlSimple - The product description in HTML format.
 * @param {string|number} product.Id - The unique identifier for the product.
 */
function productDetailsHTML(product) {
    document.querySelector("h3").textContent = product.Brand.Name;
    document.querySelector("h2").textContent = product.NameWithoutBrand;

    const productImage = document.getElementById("productImage");
    productImage.src = product.Image;
    productImage.alt = product.NameWithoutBrand

    document.getElementById("retail-price").innerHTML = `<span>Retail Price:</span> <span>$${product.SuggestedRetailPrice}</span>`;
    document.getElementById("discount").innerHTML = `<span>You save:</span> <span>${getDiscount(product.SuggestedRetailPrice, product.FinalPrice)}%</span>`;
    document.getElementById("price").innerHTML =`<span>Now:</span> $${product.FinalPrice}`;
    document.getElementById("color").innerHTML = product.Colors[0].ColorName;
    document.getElementById("description").innerHTML = product.DescriptionHtmlSimple;

    document.getElementById("addToCart").dataset.id = product.Id;

}