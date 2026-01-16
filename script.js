/**
 * POLAR'S NEW TAB - SCRIPT.JS 
 * Features: Google Suggestions, Character Streaming, Thinking Dots, 
 * and Scroll Fixes.
 */

// --- CONFIGURATION ---
const NEWS_API_KEY = '583dfe0d746e4599950a0b1f9657cf48'; 
const SEARCH_ENGINE_URL = 'https://www.google.com/search?q=';

// --- DOM ELEMENTS ---
const timeElement = document.getElementById('time');
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions');
const card = document.getElementById('main-card');
const chatHistory = document.getElementById('chat-history');
const backBtn = document.getElementById('back-btn');
const followupInput = document.getElementById('followup-input');
const sendFollowup = document.getElementById('send-followup');
const scrollAnchor = document.getElementById('scroll-anchor');
const newsContainer = document.getElementById('news-container');

// AI Memory
let conversation = [
    { role: "system", content: "You are a direct, concise assistant. Use Markdown. Do not use labels like 'AI:'." }
];

/**
 * 1. SEARCH SUGGESTIONS (JSONP Fix)
 */
window.handleSuggestions = function(data) {
    const queries = data[1];
    suggestionsBox.innerHTML = '';
    
    if (queries.length > 0) {
        suggestionsBox.style.display = 'block';
        queries.forEach(query => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = query;
            div.onclick = () => {
                searchInput.value = query;
                suggestionsBox.style.display = 'none';
                window.location.href = SEARCH_ENGINE_URL + encodeURIComponent(query);
            };
            suggestionsBox.appendChild(div);
        });
    } else {
        suggestionsBox.style.display = 'none';
    }
};

let suggestTimeout;
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    clearTimeout(suggestTimeout);

    if (query.length > 1 && !query.startsWith(':ai')) {
        suggestTimeout = setTimeout(() => {
            // Ask the background script to fetch suggestions
            chrome.runtime.sendMessage({ type: "getSuggestions", query: query }, (response) => {
                if (response && response.data) {
                    renderSuggestions(response.data);
                }
            });
        }, 200);
    } else {
        suggestionsBox.style.display = 'none';
    }
});

function renderSuggestions(queries) {
    suggestionsBox.innerHTML = '';
    
    // Limit to 5 results as requested
    const limitedQueries = queries.slice(0, 5); 

    if (limitedQueries.length > 0) {
        suggestionsBox.style.display = 'block';
        limitedQueries.forEach((query, index) => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = query;
            
            // Staggered animation delay
            div.style.animationDelay = `${index * 0.04}s`;

            div.onclick = () => {
                searchInput.value = query;
                suggestionsBox.style.display = 'none';
                window.location.href = SEARCH_ENGINE_URL + encodeURIComponent(query);
            };
            suggestionsBox.appendChild(div);
        });
    } else {
        suggestionsBox.style.display = 'none';
    }
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) suggestionsBox.style.display = 'none';
});

/**
 * 2. AI CHAT ENGINE (Streaming + Thinking Dots)
 */
function scrollToBottom(smooth = false) {
    scrollAnchor.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto', 
        block: 'end' 
    });
}

async function startAIChat(userPrompt) {
    if (!card.classList.contains('is-flipped')) card.classList.add('is-flipped');
    suggestionsBox.style.display = 'none';

    // 1. User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-entry user-entry';
    userMsg.textContent = userPrompt;
    chatHistory.appendChild(userMsg);
    
    // 2. Thinking Dots
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatHistory.appendChild(typingDiv);
    
    scrollToBottom(true);
    conversation.push({ role: "user", content: userPrompt });

    let aiMsgContainer = null; 

    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversation, model: 'openai', stream: true })
        }); 

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let fullText = "";
        let hasStartedTyping = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                const cleanLine = line.trim();
                if (cleanLine.startsWith('data: ') && cleanLine !== 'data: [DONE]') {
                    try {
                        const jsonString = cleanLine.substring(6);
                        const parsed = JSON.parse(jsonString);
                        const content = parsed.choices[0].delta.content || "";
                        
                        if (!hasStartedTyping && content !== "") {
                            // REMOVE DOTS, START TEXT + CURSOR
                            typingDiv.remove(); 
                            aiMsgContainer = document.createElement('div');
                            aiMsgContainer.className = 'chat-entry ai-entry typing'; 
                            chatHistory.appendChild(aiMsgContainer);
                            hasStartedTyping = true;
                        }

                        if (hasStartedTyping && content !== "") {
                            fullText += content;
                            aiMsgContainer.innerHTML = marked.parse(fullText);
                            scrollToBottom(false);
                        }
                    } catch (e) { continue; }
                }
            }
        }
        
        // 3. FINAL STATE: REMOVE CURSOR
        if (aiMsgContainer) {
            aiMsgContainer.classList.remove('typing'); // Cursor disappears here
            // Final render to ensure no partial markdown tags remain
            aiMsgContainer.innerHTML = marked.parse(fullText); 
            conversation.push({ role: "assistant", content: fullText });
            scrollToBottom(true);
        }

    } catch (err) {
        if (typingDiv) typingDiv.remove();
        console.error("Chat Error:", err);
    }
}

/**
 * 3. EVENT LISTENERS
 */
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query.startsWith(':ai')) {
            startAIChat(query.replace(':ai', '').trim());
            searchInput.value = '';
        } else if (query !== '') {
            window.location.href = SEARCH_ENGINE_URL + encodeURIComponent(query);
        }
    }
});

sendFollowup.addEventListener('click', () => {
    const prompt = followupInput.value.trim();
    if (prompt) {
        startAIChat(prompt);
        followupInput.value = '';
    }
});

followupInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendFollowup.click();
});

backBtn.addEventListener('click', () => {
    card.classList.remove('is-flipped');
});

/**
 * 4. UTILITIES
 */
function updateTime() {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const now = new Intl.DateTimeFormat('en-US', options).format(new Date());
    timeElement.textContent = now + " EST";
}

async function fetchNews() {
    try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`);
        const data = await response.json();
        if (data.articles) {
            newsContainer.innerHTML = data.articles.slice(0, 3).map(article => `
                <div class="news-card">
                    <a href="${article.url}" target="_blank">${article.title}</a>
                    <p>${article.source.name}</p>
                </div>
            `).join('');
        }
    } catch (err) {
        newsContainer.innerHTML = `<p>News unavailable.</p>`;
    }
}

setInterval(updateTime, 1000);
updateTime();
fetchNews();