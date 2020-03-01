
MainGame.createUpgradeShop = function () {
    /** Get the shop panel 
     * @type {HTMLElement} */
    let shop = document.getElementById('upgrade-shop');
    /** Get the shop content panel 
     * @type {HTMLElement} */
    let shopContent = document.getElementById('ushop-content');

    // Creates the close button for the shop
    let btnDiv = document.createElement('div');
    btnDiv.className = 'close';
    let btnImg = document.createElement('img');
    btnImg.src = "./assets/free-use/PaperUIKit/CloseButton.png";
    let button = document.createElement('button');
    button.innerText = 'X';
    // Events for the close button (handled through the image)
    button.onclick = this.toggleUpgradeShop;
    button.onmousedown = () => { btnImg.src = "./assets/free-use/PaperUIKit/CloseButtonPressed.png"; }
    button.onmouseup = () => { btnImg.src = "./assets/free-use/PaperUIKit/CloseButton.png"; }
    button.onmouseleave = () => { btnImg.src = "./assets/free-use/PaperUIKit/CloseButton.png"; }
    // Add the close button to HTML
    btnDiv.appendChild(btnImg);
    btnDiv.appendChild(button);
    shop.appendChild(btnDiv);

    // Creates the upgrade list for the shop
    let list = document.createElement('ul');
    shopContent.appendChild(list);

    // Create example items for the shop
    // Design example item
    let item = document.createElement('li');
    item.innerHTML += "<h3>Hero (that's you)</h3>";
    item.innerHTML += "<p><img src='assets/images/heroes/hero.png'/>";
    item.innerHTML += "Make your clicks do more damage. Be the <b>Ultimate Hero</b>!</p>";
    item.innerHTML += "<button id='hero-upgrade' type='button' onclick='upgrade(\"hero\")'>$15";
    // Add the example item to the list
    list.appendChild(item);
    // Design example item
    item = document.createElement('li');
    item.innerHTML += "<h3>Wizard</h3>";
    item.innerHTML += "<p><img src='assets/images/heroes/wizard.png'/>";
    item.innerHTML += "Through a variety of powerful magic <b>hexes</b>, the Wizard";
    item.innerHTML += " can deal passive damage to foes!</p>";
    item.innerHTML += "<button id='wizard-upgrade' type='button' onclick='upgrade(\"wizard\")'>$15";
    // Add the example item to the list
    list.appendChild(item);

}

MainGame.toggleUpgradeShop = function () {
    /** @type {HTMLElement} */
    let el = document.getElementById("upgrade-shop");
    console.log(el.style.visibility);
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    console.log(el.style.visibility);
    window.scrollTo(0, 0);
}