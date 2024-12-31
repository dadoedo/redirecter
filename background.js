let blockedSites = [];
let redirectUrl = 'https://www.perplexity.ai';
let isEnabled = true;

// Load settings
chrome.storage.local.get(['blockedSites', 'redirectUrl', 'isEnabled'], (result) => {
  blockedSites = result.blockedSites || [];
  redirectUrl = result.redirectUrl || 'https://www.perplexity.ai';
  isEnabled = result.isEnabled ?? true;
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.blockedSites) blockedSites = changes.blockedSites.newValue || [];
  if (changes.redirectUrl) redirectUrl = changes.redirectUrl.newValue || 'https://www.perplexity.ai';
  if (changes.isEnabled) isEnabled = changes.isEnabled.newValue;
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (!isEnabled || details.frameId !== 0) return;

  const url = new URL(details.url);
  const hostname = url.hostname;

  const isBlocked = blockedSites.some(site => {
    const cleanSite = site.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    const cleanHostname = hostname.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    return cleanHostname.includes(cleanSite);
  });

  if (isBlocked) {
    chrome.tabs.update(details.tabId, {
      url: redirectUrl
    });
  }
});