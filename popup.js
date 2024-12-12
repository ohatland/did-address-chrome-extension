document.addEventListener('DOMContentLoaded', () => {
  const addressList = document.getElementById('addressList');
  const nameInput = document.getElementById('nameInput');
  const didInput = document.getElementById('didInput');
  const addButton = document.getElementById('addButton');

  // Hent lagrede adresser ved oppstart
  chrome.storage.sync.get(['didAddresses'], (result) => {
    const addresses = result.didAddresses || [];
    renderAddresses(addresses);
  });

  addButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const did = didInput.value.trim();
    if (name && did) {
      chrome.storage.sync.get(['didAddresses'], (result) => {
        const addresses = result.didAddresses || [];
        addresses.push({name, address: did});
        chrome.storage.sync.set({didAddresses: addresses}, () => {
          nameInput.value = '';
          didInput.value = '';
          renderAddresses(addresses);
        });
      });
    }
  });

  function renderAddresses(addresses) {
    addressList.innerHTML = '';
    addresses.forEach((entry, index) => {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'space-between';
      container.style.border = '1px solid #ddd';
      container.style.margin = '5px 0';
      container.style.padding = '5px';

      const textDiv = document.createElement('div');
      textDiv.textContent = `${entry.name} (${entry.address})`;
      textDiv.style.cursor = 'pointer';
      textDiv.addEventListener('click', () => {
        // Send melding til content_script for å fylle inn DID-adressen
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {type: 'fillDid', address: entry.address});
        });
      });

      // Legg til en knapp for å fjerne adresse
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Fjern';
      removeButton.style.marginLeft = '10px';
      removeButton.addEventListener('click', () => {
        // Fjern adressen fra listen
        addresses.splice(index, 1);
        chrome.storage.sync.set({didAddresses: addresses}, () => {
          renderAddresses(addresses);
        });
      });

      container.appendChild(textDiv);
      container.appendChild(removeButton);
      addressList.appendChild(container);
    });
  }
});
