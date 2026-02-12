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

const customName = document.getElementById('custom-name');
const customBase = document.getElementById('custom-base');
const customShot = document.getElementById('custom-shot');
const customTotal = document.getElementById('custom-total');
const addCustomButton = document.getElementById('add-custom');
const extraCheckboxes = document.querySelectorAll('.extra-check');

const selected = new Map();
const customItems = [];
let customIndex = 1;

const formatMoney = (value) => {
  const rounded = Math.round(value * 100) / 100;
  const hasDecimals = rounded % 1 !== 0;
  const formatted = hasDecimals ? rounded.toFixed(2) : rounded.toFixed(0);
  return `€${formatted.replace('.', ',')}`;
};

const createOrderRow = (item, removable) => {
  const row = document.createElement('div');
  row.className = 'order-item';

  const details = document.createElement('div');
  details.className = 'item-details';

  const name = document.createElement('span');
  name.textContent = item.name;

  if (item.alcohol) {
    const alcohol = document.createElement('small');
    alcohol.textContent = `(${item.alcohol})`;
    name.appendChild(document.createTextNode(' '));
    name.appendChild(alcohol);
  }

  details.appendChild(name);

  if (item.meta) {
    const meta = document.createElement('small');
    meta.className = 'item-meta';
    meta.textContent = item.meta;
    details.appendChild(meta);
  }

  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const price = document.createElement('strong');
  price.textContent = formatMoney(item.price);
  actions.appendChild(price);

  if (removable) {
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-item';
    remove.dataset.id = item.id;
    remove.textContent = 'Quitar';
    actions.appendChild(remove);
  }

  row.append(details, actions);
  return row;
};

const updateOrder = () => {
  orderList.innerHTML = '';

  const totalItems = selected.size + customItems.length;
  if (totalItems === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Aún no seleccionas pizzas.';
    orderList.appendChild(empty);
    orderTotal.textContent = formatMoney(0);
    orderCount.textContent = '0';
    return;
  }

  let total = 0;
  const fragment = document.createDocumentFragment();

  selected.forEach((item) => {
    total += item.price;
    fragment.appendChild(createOrderRow(item, false));
  });

  customItems.forEach((item) => {
    total += item.price;
    const extrasLabel = item.extras.length ? item.extras.join(', ') : 'Sin extras';
    fragment.appendChild(
      createOrderRow(
        {
          ...item,
          meta: `Base: ${item.base} · Extras: ${extrasLabel}`,
        },
        true
      )
    );
  });

  orderList.appendChild(fragment);
  orderTotal.textContent = formatMoney(total);
  orderCount.textContent = String(totalItems);
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

const getCustomBase = () => {
  if (!customBase) {
    return { price: 0, label: '' };
  }
  const option = customBase.options[customBase.selectedIndex];
  return {
    price: Number(customBase.value),
    label: option?.dataset?.label || option?.textContent || 'Base',
  };
};

const getCustomExtras = () => {
  const extras = [];
  let extrasTotal = 0;
  extraCheckboxes.forEach((extra) => {
    if (extra.checked) {
      extras.push(extra.dataset.name);
      extrasTotal += Number(extra.dataset.price);
    }
  });
  return { extras, extrasTotal };
};

const updateCustomTotal = () => {
  if (!customTotal) {
    return;
  }
  const base = getCustomBase();
  const { extrasTotal } = getCustomExtras();
  const total = base.price + extrasTotal;
  customTotal.textContent = formatMoney(total);
};

if (customBase) {
  customBase.addEventListener('change', updateCustomTotal);
}

extraCheckboxes.forEach((extra) => {
  extra.addEventListener('change', updateCustomTotal);
});

if (addCustomButton) {
  addCustomButton.addEventListener('click', () => {
    if (!customBase || !customShot) {
      return;
    }

    const base = getCustomBase();
    const { extras, extrasTotal } = getCustomExtras();
    const nameValue = customName ? customName.value.trim() : '';
    const displayName = nameValue || `Pizza personalizada ${customIndex}`;
    const id = `custom-${Date.now()}-${customIndex}`;

    customIndex += 1;

    customItems.push({
      id,
      name: displayName,
      price: base.price + extrasTotal,
      alcohol: customShot.value,
      base: base.label,
      extras,
    });

    if (customName) {
      customName.value = '';
    }
    extraCheckboxes.forEach((extra) => {
      extra.checked = false;
    });

    updateCustomTotal();
    updateOrder();
  });
}

if (orderList) {
  orderList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    if (target.classList.contains('remove-item')) {
      const id = target.dataset.id;
      const index = customItems.findIndex((item) => item.id === id);
      if (index !== -1) {
        customItems.splice(index, 1);
        updateOrder();
      }
    }
  });
}

updateCustomTotal();
updateOrder();
