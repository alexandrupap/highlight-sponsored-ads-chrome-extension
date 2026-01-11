// Open options page on install or reload
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install' || details.reason === 'update') {
        chrome.runtime.openOptionsPage();
    }
});
