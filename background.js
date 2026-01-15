chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getSuggestions") {
    fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(request.query)}`)
      .then(response => response.json())
      .then(data => sendResponse({ data: data[1] }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // keeps message channel open for async response, just for google suggestions :)
  }
});

