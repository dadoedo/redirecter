let blockedSites = [];
let redirectUrl = 'https://www.perplexity.ai';
let isEnabled = true;
let siteToRemove = null;

// Load settings
chrome.storage.local.get(['blockedSites', 'redirectUrl', 'isEnabled'], (result) => {
  blockedSites = result.blockedSites || [];
  redirectUrl = result.redirectUrl || 'https://www.perplexity.ai';
  isEnabled = result.isEnabled ?? true;

  document.getElementById('toggleSwitch').checked = isEnabled;
  updateSiteList();
  updateSiteCount();
  toggleEmptyState();
  updateRedirectDisplay();
});

// Handle toggle switch
document.getElementById('toggleSwitch').addEventListener('change', function(e) {
  if (this.checked) {
    // Enabling - no confirmation needed
    isEnabled = true;
    chrome.storage.local.set({ isEnabled });
  } else {
    // Show confirmation modal
    e.preventDefault();
    this.checked = true; // Keep switch on until confirmed
    showConfirmationModal();
  }
});

function showConfirmationModal() {
  const modal = document.getElementById('confirmModal');
  const countdown = document.getElementById('countdown');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  let count = 5;

  modal.classList.add('show');

  const timer = setInterval(() => {
    count--;
    countdown.textContent = count;

    if (count === 0) {
      clearInterval(timer);
      confirmBtn.classList.remove('hidden');
      countdown.classList.add('hidden');
    }
  }, 1000);

  confirmBtn.onclick = () => {
    isEnabled = false;
    document.getElementById('toggleSwitch').checked = false;
    chrome.storage.local.set({ isEnabled });
    modal.classList.remove('show');
    clearInterval(timer);
  };

  cancelBtn.onclick = () => {
    modal.classList.remove('show');
    clearInterval(timer);
  };
}

document.getElementById('redirectForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('redirectInput');
  let newUrl = input.value.trim();

  // Add https:// if no protocol specified
  if (!/^https?:\/\//i.test(newUrl)) {
    newUrl = 'https://' + newUrl;
  }

  try {
    new URL(newUrl); // Validate URL
    redirectUrl = newUrl;
    chrome.storage.local.set({ redirectUrl });
    input.value = '';
    updateRedirectDisplay();

    // Show success message
    const currentRedirect = document.getElementById('currentRedirect');
    currentRedirect.textContent = `✓ Redirect updated successfully`;
    currentRedirect.className = 'text-xs text-green-600 mt-1';
    setTimeout(() => {
      updateRedirectDisplay();
    }, 2000);
  } catch (e) {
    // Show error message
    const currentRedirect = document.getElementById('currentRedirect');
    currentRedirect.textContent = `✗ Please enter a valid URL`;
    currentRedirect.className = 'text-xs text-red-600 mt-1';
  }
});

function updateRedirectDisplay() {
  const currentRedirect = document.getElementById('currentRedirect');
  currentRedirect.textContent = `Current redirect: ${redirectUrl}`;
  currentRedirect.className = 'text-xs text-gray-500 mt-1';
}

// Add new site
document.getElementById('addSiteForm').addEventListener('submit', (e) => {
e.preventDefault();
const input = document.getElementById('siteInput');
const site = input.value.trim().toLowerCase();

if (site && !blockedSites.includes(site)) {
  blockedSites.push(site);
  chrome.storage.local.set({ blockedSites });
  input.value = '';
  updateSiteList();
  updateSiteCount();
  toggleEmptyState();
}
});

function updateSiteCount() {
const count = document.getElementById('siteCount');
count.textContent = `${blockedSites.length} site${blockedSites.length === 1 ? '' : 's'}`;
}

function toggleEmptyState() {
const emptyState = document.getElementById('emptyState');
emptyState.classList.toggle('hidden', blockedSites.length > 0);
}

function updateSiteList() {function updateSiteList() {
    const siteList = document.getElementById('siteList');
    siteList.innerHTML = '';

    blockedSites.forEach((site) => {
        const div = document.createElement('div');
        div.className = 'site-item bg-white rounded-lg shadow-sm p-3 flex items-center justify-between';

        const siteText = document.createElement('span');
        siteText.className = 'text-gray-700';
        siteText.textContent = site;

        const removeButton = document.createElement('button');
        removeButton.className = 'text-red-600 hover:text-red-700 transition-colors';
        removeButton.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        `;

        removeButton.onclick = () => {
            showRemoveSiteConfirmation(site, div);
        };

        div.appendChild(siteText);
        div.appendChild(removeButton);
        siteList.appendChild(div);
    });
}

function showRemoveSiteConfirmation(site, siteElement) {
  const modal = document.getElementById('removeSiteModal');
  const countdown = document.getElementById('removeCountdown');
  const confirmBtn = document.getElementById('confirmRemoveBtn');
  const cancelBtn = document.getElementById('cancelRemoveBtn');
  const siteDisplay = document.getElementById('siteToRemove');
  let count = 5;

  siteToRemove = site;
  siteDisplay.textContent = site;
  modal.classList.add('show');
  confirmBtn.classList.add('hidden');
  countdown.classList.remove('hidden');
  countdown.textContent = count;

  const timer = setInterval(() => {
    count--;
    countdown.textContent = count;

    if (count === 0) {
      clearInterval(timer);
      confirmBtn.classList.remove('hidden');
      countdown.classList.add('hidden');
    }
  }, 1000);

  confirmBtn.onclick = () => {
    siteElement.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      blockedSites = blockedSites.filter(s => s !== site);
      chrome.storage.local.set({ blockedSites });
      updateSiteList();
      updateSiteCount();
      toggleEmptyState();
      modal.classList.remove('show');
    }, 280);
    clearInterval(timer);
  };

  cancelBtn.onclick = () => {
    modal.classList.remove('show');
    clearInterval(timer);
  };
}


const siteList = document.getElementById('siteList');
siteList.innerHTML = '';

blockedSites.forEach((site) => {
  const div = document.createElement('div');
  div.className = 'site-item bg-white rounded-lg shadow-sm p-3 flex items-center justify-between';

  const siteText = document.createElement('span');
  siteText.className = 'text-gray-700';
  siteText.textContent = site;

  const removeButton = document.createElement('button');
  removeButton.className = 'text-red-600 hover:text-red-700 transition-colors';
  removeButton.innerHTML = `
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>
`;

  removeButton.onclick = () => {
    div.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      blockedSites = blockedSites.filter(s => s !== site);
      chrome.storage.local.set({ blockedSites });
      updateSiteList();
      updateSiteCount();
      toggleEmptyState();
    }, 280);
  };

  div.appendChild(siteText);
  div.appendChild(removeButton);
  siteList.appendChild(div);
});
}