const logoImages = document.querySelectorAll('.brand-icon img');
logoImages.forEach((img) => {
  img.addEventListener('error', () => {
    const container = img.closest('.brand-icon');
    if (container) {
      container.classList.add('no-logo');
    }
  });
});

const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.pizza-card');
const orderList = document.getElementById('order-list');
const orderTotal = document.getElementById('order-total');
const orderCount = document.getElementById('order-count');

const selected = new Map();

const formatMoney = (value) => `$${value}`;

const updateOrder = () => {
  orderList.innerHTML = '';

  if (selected.size === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Aún no seleccionas pizzas.';
    orderList.appendChild(empty);
    orderTotal.textContent = '$0';
    orderCount.textContent = '0';
    return;
  }

  let total = 0;
  selected.forEach((item) => {
    total += item.price;
    const row = document.createElement('div');
    row.className = 'order-item';
    row.innerHTML = `
      <span>${item.name} <small>(${item.alcohol})</small></span>
      <strong>${formatMoney(item.price)}</strong>
    `;
    orderList.appendChild(row);
  });

  orderTotal.textContent = formatMoney(total);
  orderCount.textContent = String(selected.size);
};

const applyFilter = (filter) => {
  cards.forEach((card) => {
    const show = filter === 'all' || card.dataset.alcohol === filter;
    card.style.display = show ? '' : 'none';
  });
};

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((btn) => btn.classList.remove('active'));
    chip.classList.add('active');
    applyFilter(chip.dataset.filter);
  });
});

const checkboxList = document.querySelectorAll('.select-pizza');
checkboxList.forEach((checkbox) => {
  checkbox.addEventListener('change', (event) => {
    const target = event.target;
    const item = {
      name: target.dataset.name,
      price: Number(target.dataset.price),
      alcohol: target.dataset.alcohol,
    };

    if (target.checked) {
      selected.set(item.name, item);
    } else {
      selected.delete(item.name);
    }

    updateOrder();
  });
});

updateOrder();

