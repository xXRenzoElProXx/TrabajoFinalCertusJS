class Item {
    constructor(name, price, stock) {
        this.name = name;
        this.price = price;
        this.stock = stock;
    }
}

class UI {
    addItemToList(item) {
        const list = document.getElementById('item-list');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td${item.stock === 'available' ? ' class="text-success fw-bold">Disponible' : ' class="text-danger fw-bold">Agotado'}</td>
            <td>
                <a class="edit btn btn-primary">Editar</a>
                <a class="delete btn btn-danger">Borrar</a>
            </td>`;
        list.appendChild(row);
    }

    deleteItem(target) {
        if (target.classList.contains('delete')) {
            target.parentElement.parentElement.remove();
            return true;
        }
        return false;
    }

    clearFields() {
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('stock').value = 'available';
    }

    updateItem(item) {
        const list = document.getElementById('item-list').getElementsByTagName('tr');
        for (let i = 0; i < list.length; i++) {
            const currentItem = list[i].getElementsByTagName('td')[0].textContent;
            if (currentItem === item.name) {
                list[i].getElementsByTagName('td')[1].textContent = item.price;
                list[i].getElementsByTagName('td')[2].textContent = item.stock === 'available' ? 'Disponible' : 'Agotado';
                const items = Store.getItems();
                items.forEach((storedItem, index) => {
                    if (storedItem.name === item.name) {
                        items[index] = item;
                    }
                });
                localStorage.setItem('items', JSON.stringify(items));
                return true;
            }
        }
        return false;
    }

    showAlertSuccess(message, className) {
        const alertDiv = document.getElementById('alert-success');
        alertDiv.textContent = message;
        alertDiv.className = `alert-success ${className}`;
        alertDiv.style.display = 'block';

        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 3000);
    }

    showAlertDanger(message, className) {
        const alertDiv = document.getElementById('alert-danger');
        alertDiv.textContent = message;
        alertDiv.className = `alert-danger ${className}`;
        alertDiv.style.display = 'block';

        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 3000);
    }
}

class Store {
    static getItems() {
        let items;
        if (localStorage.getItem('items') === null) {
            items = [];
        } else {
            items = JSON.parse(localStorage.getItem('items'));
        }
        return items;
    }

    static displayItems() {
        const items = Store.getItems();
        const ui = new UI();
        items.forEach(function (item) {
            ui.addItemToList(item);
        })
    }

    static addItem(item) {
        const items = Store.getItems();
        items.push(item);
        localStorage.setItem('items', JSON.stringify(items));
    }

    static removeItem(name) {
        const items = Store.getItems();
        items.forEach(function (item, index) {
            if (item.name === name) {
                items.splice(index, 1);
            }
        });
        localStorage.setItem('items', JSON.stringify(items));
    }

    static itemExists(name) {
        const items = Store.getItems();
        return items.some(item => item.name === name);
    }
}

document.addEventListener('DOMContentLoaded', Store.displayItems());

document.getElementById('item-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;

    const item = new Item(name, price, stock);
    const ui = new UI();

    const items = Store.getItems();
    if (items.some(existingItem => existingItem.name === item.name)) {
        ui.showAlertDanger('El artículo ya existe en el inventario', 'alert-danger');
        ui.clearFields();
        document.getElementById('name').focus();
        return;
    }

    Store.addItem(item);
    ui.addItemToList(item);
    ui.showAlertSuccess('Producto registrado', 'alert-success');
    ui.clearFields();
    document.getElementById('name').focus();
});


document.getElementById('update-btn').addEventListener('click', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;

    const item = new Item(name, price, stock);
    const ui = new UI();
    if (ui.updateItem(item)) {
        ui.showAlertSuccess('Producto actualizado', 'alert-success');
        ui.clearFields();
        document.getElementById('name').focus();
    } else {
        ui.showAlertDanger('Producto no encontrado', 'alert-danger');
        ui.clearFields();
        document.getElementById('name').focus();
    }
    ui.clearFields();
});

document.getElementById('item-list').addEventListener('click', function (e) {
    const ui = new UI();
    if (e.target.classList.contains('edit')) {
        const name = e.target.parentElement.parentElement.children[0].textContent;
        const price = e.target.parentElement.parentElement.children[1].textContent;
        const stock = e.target.parentElement.parentElement.children[2].textContent === 'Disponible' ? 'available' : 'out-of-stock';

        document.getElementById('name').value = name;
        document.getElementById('price').value = price;
        document.getElementById('stock').value = stock;
    }
    if (ui.deleteItem(e.target)) {
        Store.removeItem(e.target.parentElement.parentElement.firstElementChild.textContent);
        ui.showAlertDanger('Producto eliminado', 'alert-success');
        ui.clearFields();
        document.getElementById('name').focus();
    }
    e.preventDefault();
});