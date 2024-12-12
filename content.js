const didField = document.querySelector('input[type="did"]');
if (didField) {
  // Finn posisjonen til inputfeltet
  const rect = didField.getBoundingClientRect();
  
  // Opprett en knapp
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Velg DID';

  // Legg til noe enkel styling på knappen
  button.style.position = 'absolute';
  button.style.top = (window.scrollY + rect.bottom + 3) + 'px'; 
  // 10px under inputfeltet
  button.style.left = (window.scrollX + rect.left) + 'px';
  button.style.zIndex = 9999; // sørg for at knappen ligger over annet innhold
  button.style.backgroundColor = '#4CAF50'; // eksempel: grønn bakgrunn
  button.style.color = '#fff'; // hvit tekst
  button.style.border = 'none';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '14px';

  // Legg til en "hover"-effekt ved hjelp av JS (enkelt)
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#45a049';
  });
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#4CAF50';
  });

  // Legg knappen til i body
  document.body.appendChild(button);

  button.addEventListener('click', () => {
    showDIDSelectionBox(didField, button);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'fillDid') {
    // console.log("message", message)
    const didField = document.querySelector('input[type="did"]');
    if (didField) {
      didField.value = message.address;
      didField.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
});

function showDIDSelectionBox(didField, button) {
  // Hent adresser fra storage
  chrome.storage.sync.get(['didAddresses'], (result) => {
    const addresses = result.didAddresses || [];
    
    // Opprett en boks
    const box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.background = '#fff';
    box.style.border = '1px solid #ccc';
    box.style.padding = '5px';
    box.style.zIndex = '9999';

    // Finn posisjonen til knappen for å plassere boksen under inputfeltet
    const rect = button.getBoundingClientRect();
    box.style.top = (window.scrollY + rect.bottom) + 'px';
    box.style.left = (window.scrollX + rect.left) + 'px';

    // Fyll boksen med adresser
    addresses.forEach((entry) => {
      const option = document.createElement('div');
      option.textContent = `${entry.name} (${entry.address})`;
      option.style.cursor = 'pointer';
      option.style.padding = '2px 5px';
      option.addEventListener('mouseover', () => {
        option.style.background = '#eee';
      });
      option.addEventListener('mouseout', () => {
        option.style.background = '#fff';
      });
      option.addEventListener('click', () => {
        // Sett inn adressen i feltet
        didField.value = entry.address;
        // Trigger en input event for å oppdatere eventuelle lyttere på siden
        didField.dispatchEvent(new Event('input', {bubbles: true}));
        document.body.removeChild(box);
      });

      box.appendChild(option);
    });

    // Legg boksen til i dokumentet
    document.body.appendChild(box);

    // Klikk utenfor boksen skal lukke den
    const clickHandler = (e) => {
      if (!box.contains(e.target) && e.target !== button) {
        if (box && box.parentNode) {
          box.parentNode.removeChild(box);
        }
        document.removeEventListener('click', clickHandler);
      }
    };
    document.addEventListener('click', clickHandler);
  });
}