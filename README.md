# Custom New Tab
My name is Polar, and this is Custom New Tab. 

If you're seeing this, you most likely didn't snag this off of the extensions store like everyone else, and I probably sent you this file personally.

This file is a getting started guide, and a customization guide. It also contains credits, how-to's for extension debugging, and detailed-ish documentation.

## Name
**Here's how to customize the name in the new tab**
1. Go to `index.html`
2. Find line 18 in the code `<span class="word">Josh.</span>`
3. Change the value "Josh." to your name (EX. `<span class="word">Ryan.</span>`)
4. Hit CTRL + S on your keyboard on Windows, and on MacOS, hit CMD + S to save the file.
5. Reload the extension.

## Adding the extension
**A short tutorial on how to add the extension to your browser**
- Chrome Users
1. Enter `chrome://extensions` in your URL input bar
2. Find the "Developer Mode" toggle and ensure it's enabled. 
3. Click the "Load Unpacked" button 
4. Select this folder with the source code to the new tab code, and select that as your unpacked extension
5. Scroll down to other extensions in the chrome tab
6. Ensure it's added and done.
7. Test it out by opening a new tab!

- MS Edge Users
1. Enter `edge://extensions` in your URL input bar
2. Find the "Developer Mode" toggle on the left and ensure it's enabled.
3. Click the "Load Unpacked" button (or the left-most button, looks like a box, not the folder with a zipper) at the top right
4. Find this folder, and select it
5. Ensure the extension is enabled after you add it
6. Test it out by opening a new tab!

## Reloading the extension
**A quick guide to reloading the extension**
This is meant only if you updated the extension yourself, like changing the name, time, or any code in the extension source.

- Chrome
1. Head over to `chrome://extensions`
2. Find the extension in your list of extensions
3. Click the "Reload" button in the extensions card
4. Reopen a new tab!

- MS Edge
1. Head over to `edge://extensions`
2. Find the extension in your list of extensions
3. Click the "Reload" button in the extensions card
4. Reopen a new tab!

## Using the AI chatbot
**Hotkeys and a how-to for the AI chatbot in the extension**
I also added an AI chatbot into the search engine, it isn't too secret to be honest. Simply click on the input box in the page, and type `:ai`, then your message. Examples: `:ai Hey there!`, `:ai What's the weather looking like for Michigan tomorrow?`

**AI Chatbot is made by Pollinators AI. Please do not touch or mess with the AI search code in script.js as it is vital for this extension to function. The AI is only triggered when you input a prompt.**

## Removing the News posts
**A simple how-to for removing the news section**
1. Open `index.html` in the extension source code folder.
2. Find this line: `<div id="news-container" class="news-grid"></div>` or line 25
3. Simply delete the line or comment it out

## Common Questions
- Q. Why can't I scroll in the AI chat? A. I'm trying to fix this issue, I can't seem to determine what the problem is, but for now, just hold down your left mouse button over text to select it, and move your cursor to the bottom or top of the screen to scroll up and down.

- Q. How do I remove the AI feature? A. I know there are some people who refuse to use AI related products. The AI can not function or use any resources UNLESS you activate it by sending it a prompt. The AI itself doesn't run on water, it runs with Solar Power.

- Q. Why aren't the news posts & search recommendations showing? A. Sometimes, workplaces like schools have Google's search recommendation URL blocked, stopping search suggestions from appearing. News posts are the same story.

## Libraries
**All of the libraries used (FOR DEVELOPERS/DEBUGGERS)**
- MarkedJS - Stored in `marked.js`, used for letting the AI use Markdown
- Puter AI - Fallback in case Pollinator AI fails, stored in `puter.js`
- Google Search - Used for providing search suggestions, utilized in `background.js` and `script.js` to serve to `index.html`
- Pollinator AI - Used for the `:ai` chat function, generating AI responses
- Google Fonts - Stores and loads the Montserrat font used


## Credits
Polar (Josh) - Creating the HTML, CSS, and JS code <br>
Pollinator AI - Powering the AI chatbot built in <br>
News API - Supplying daily news updates globaly <br>
Google Gemini - Helping out with the page flipping animations