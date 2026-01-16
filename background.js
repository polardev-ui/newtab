chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "getSuggestions") {
        const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(request.query)}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => sendResponse({ data: data[1] })) // data[1] is the array of strings
            .catch(error => sendResponse({ error: error.message }));
        
        return true; // Keep the message channel open for async response
    }
});