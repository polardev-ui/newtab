/**
 * POLAR'S NEW TAB - SCRIPT.JS 
 * Features: True Character-by-Character Streaming, Markdown Support, 
 * and Per-Element Animations.
 */

// --- CONFIGURATION ---
const NEWS_API_KEY = '583dfe0d746e4599950a0b1f9657cf48'; 
const SEARCH_ENGINE_URL = 'https://www.google.com/search?q=';

// --- DOM ELEMENTS ---
const timeElement = document.getElementById('time');
const searchInput = document.getElementById('search-input');
const card = document.getElementById('main-card');
const chatHistory = document.getElementById('chat-history');
const backBtn = document.getElementById('back-btn');
const followupInput = document.getElementById('followup-input');
const sendFollowup = document.getElementById('send-followup');
const scrollAnchor = document.getElementById('scroll-anchor');
const newsContainer = document.getElementById('news-container');

// ai memory and personality, customizes how it talks
let conversation = [
    { role: "system", content: "You are a direct, concise assistant. Use Markdown. Do not use labels like 'AI:'." }
];

/**
 * ai chat engine (streaming)
 */
async function startAIChat(userPrompt) {
    if (!card.classList.contains('is-flipped')) card.classList.add('is-flipped');

    // add a user image to queue
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-entry user-entry';
    userMsg.textContent = userPrompt;
    chatHistory.appendChild(userMsg);
    
    // reasons and thinks with display
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatHistory.appendChild(typingDiv);
    
    scrollAnchor.scrollIntoView({ behavior: 'smooth' });

    conversation.push({ role: "user", content: userPrompt });

    try {
        const response = await fetch('https://text.pollinations.ai/', { // call pollinations thingy for chatgpt
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversation, model: 'openai', stream: true })
        }); 

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let fullText = "";
        let renderedLength = 0;
        let aiMsgContainer = null; 
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
                        
                        // REMOVE DOTS AND START AI CONTAINER ON FIRST CONTENT
                        if (!hasStartedTyping && content !== "") {
                            typingDiv.remove(); // thinking dots all disappear
                            aiMsgContainer = document.createElement('div');
                            aiMsgContainer.className = 'chat-entry ai-entry';
                            chatHistory.appendChild(aiMsgContainer);
                            hasStartedTyping = true;
                        }

                        fullText += content;

                        if (hasStartedTyping) {
                            const newChars = fullText.substring(renderedLength);
                            for (let char of newChars) {
                                const span = document.createElement('span');
                                span.className = 'ai-word'; // custom blur/fade/slide up animation
                                span.textContent = char === " " ? "\u00A0" : char;
                                aiMsgContainer.appendChild(span);
                            }
                            renderedLength = fullText.length;
                            scrollAnchor.scrollIntoView({ behavior: 'auto', block: 'end' });
                        }
                    } catch (e) { continue; }
                }
            }
        }
        
        setTimeout(() => {
            if (aiMsgContainer) aiMsgContainer.innerHTML = marked.parse(fullText);
        }, 300);

        conversation.push({ role: "assistant", content: fullText });

    } catch (err) {
        typingDiv.remove();
        console.error("Chat Error:", err);
    }
}

/**
 * all of the event listeners
 */

// search
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

// ai follow up
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

// flipping from ai to main page
backBtn.addEventListener('click', () => {
    card.classList.remove('is-flipped');
});

/**
 * utilities
 */
function updateTime() {
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const now = new Intl.DateTimeFormat('en-US', options).format(new Date());
    timeElement.textContent = now + " EST"; // change this to your timezone if you aren't eastern standard time
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

// don't touch this pls
setInterval(updateTime, 1000);
updateTime();
fetchNews();