let didButton = null;

// Funksjon for å opprette eller oppdatere knappen
function createOrUpdateDidButton() {
  const didField = document.querySelector('input[type="did"]');
  // Hvis feltet ikke finnes, fjern knappen hvis den eksisterer, og returner
  if (!didField) {
    if (didButton && didButton.parentNode) {
      didButton.parentNode.removeChild(didButton);
    }
    didButton = null;
    return;
  }

  // Nå vet vi at feltet finnes.
  // Hvis knappen ikke finnes eller er fjernet fra DOM, opprett den
  if (!didButton || !didButton.parentNode) {
    didButton = document.createElement('button');
    didButton.type = 'button';
    didButton.textContent = 'Velg DID';
    styleAndPositionButton(didField, didButton);
    document.body.appendChild(didButton);

    didButton.addEventListener('click', () => {
      showDIDSelectionBox(didField, didButton);
    });
    return;
  }

  // Hvis vi kommer hit, finnes både feltet og knappen allerede.
  // Juster kun posisjonen på knappen
  styleAndPositionButton(didField, didButton);
}

function showDIDSelectionBox(didField, button) {
  // Hent adresser fra lagringen
  chrome.storage.sync.get(['didAddresses'], (result) => {
    const addresses = result.didAddresses || [];
    
    // Hvis det ikke finnes noen adresser, vis en enkel melding
    if (addresses.length === 0) {
      alert('Ingen DID-adresser er lagret enda.');
      return;
    }

    // Opprett en boks
    const box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.background = '#fff';
    box.style.border = '1px solid #ccc';
    box.style.padding = '5px';
    box.style.zIndex = '9999';
    box.style.minWidth = '200px';
    box.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';

    // Finn posisjonen til knappen for å plassere boksen under den
    const rect = button.getBoundingClientRect();
    box.style.top = (window.scrollY + rect.bottom) + 'px';
    box.style.left = (window.scrollX + rect.left) + 'px';

    // Fyll boksen med adresser
    addresses.forEach((entry) => {
      const option = document.createElement('div');
      option.textContent = `${entry.name} (${entry.address})`;
      option.style.cursor = 'pointer';
      option.style.padding = '5px';
      option.addEventListener('mouseenter', () => {
        option.style.background = '#eee';
      });
      option.addEventListener('mouseleave', () => {
        option.style.background = '#fff';
      });
      option.addEventListener('click', () => {
        // Sett inn adressen i feltet
        didField.value = entry.address;
        didField.dispatchEvent(new Event('input', {bubbles: true}));

        // Fjern boksen
        if (box.parentNode) {
          box.parentNode.removeChild(box);
        }
      });

      box.appendChild(option);
    });

    // Legg boksen til i dokumentet
    document.body.appendChild(box);

    // Klikk utenfor boksen skal lukke den
    const clickHandler = (e) => {
      if (!box.contains(e.target) && e.target !== button) {
        if (box.parentNode) {
          box.parentNode.removeChild(box);
        }
        document.removeEventListener('click', clickHandler);
      }
    };
    document.addEventListener('click', clickHandler);
  });
}

// Funksjon for å style og posisjonere knappen
function styleAndPositionButton(didField, button) {
  const rect = didField.getBoundingClientRect();
  button.style.position = 'absolute';
  button.style.top = (window.scrollY + rect.bottom + 10) + 'px';
  // Plasser knappen under feltet med 10px margin
  button.style.left = (window.scrollX + rect.left) + 'px';
  button.style.zIndex = '9999';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = '#fff';
  button.style.border = 'none';
  button.style.padding = '8px 12px';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontSize = '14px';

  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#45a049';
  });
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#4CAF50';
  });
}

// Kall createOrUpdateDidButton ved initial lasting av siden
document.addEventListener('DOMContentLoaded', createOrUpdateDidButton);

createOrUpdateDidButton();

// Fjern knappen hvis det ikke finnes et input felt av type did, skjer f.eks ved bytte av side
const observer = new MutationObserver(() => {
  // Koble fra observeren for å unngå loop
  observer.disconnect();
  createOrUpdateDidButton();
  // Koble observeren til igjen
  observer.observe(document.body, { childList: true, subtree: true });
});

observer.observe(document.body, { childList: true, subtree: true });

// Lytt til vinduets størrelsesendringer og oppdater knappens posisjon
window.addEventListener('resize', () => {
  const didField = document.querySelector('input[type="did"]');
  if (didField) {
    styleAndPositionButton(didField, didButton);
  }
});

// showDIDSelectionBox-funksjonen må du implementere et annet sted i koden din.
// Den skal håndtere logikken for å vise en liste over DID-adresser og fylle inn den valgte.
