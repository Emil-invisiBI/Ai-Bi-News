// AI Chat Widget - Powered by Hugging Face (Free)
(function() {
    const SYSTEM_PROMPT = `You are a helpful AI assistant for a Business Intelligence and AI news website. You specialize in Power BI, Microsoft Fabric, DAX, and AI tools. Be concise and helpful.`;

    const widget = document.createElement('div');
    widget.id = 'ai-chat-widget';
    widget.innerHTML = `
        <button id="chat-toggle" aria-label="Open AI Chat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </button>
        <div id="chat-panel">
            <div id="chat-header">
                <span>🤖 AI Assistant</span>
                <button id="chat-close" aria-label="Close">×</button>
            </div>
            <div id="chat-messages">
                <div class="chat-msg bot">
                    <div class="msg-content">Hi! Ask me about Power BI, Fabric, DAX, certifications, or AI tools!</div>
                </div>
            </div>
            <div id="chat-input-area">
                <input type="text" id="chat-input" placeholder="Ask about Power BI, DAX, AI..." />
                <button id="chat-send" aria-label="Send">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
            <div id="chat-footer">Powered by Hugging Face • Free AI</div>
        </div>
    `;

    const styles = document.createElement('style');
    styles.textContent = `
        #ai-chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'Inter', -apple-system, sans-serif; }
        #chat-toggle { width: 56px; height: 56px; border-radius: 50%; background: #111; color: white; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform 0.2s; display: flex; align-items: center; justify-content: center; }
        #chat-toggle:hover { transform: scale(1.05); }
        #chat-panel { display: none; position: absolute; bottom: 70px; right: 0; width: 360px; max-width: calc(100vw - 48px); height: 480px; max-height: calc(100vh - 120px); background: white; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.15); flex-direction: column; overflow: hidden; }
        #chat-panel.open { display: flex; }
        #chat-header { padding: 16px 20px; background: #111; color: white; font-size: 0.9rem; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
        #chat-close { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; line-height: 1; opacity: 0.7; }
        #chat-close:hover { opacity: 1; }
        #chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .chat-msg { display: flex; }
        .chat-msg.user { justify-content: flex-end; }
        .msg-content { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
        .chat-msg.bot .msg-content { background: #f5f5f5; color: #111; border-bottom-left-radius: 4px; }
        .chat-msg.user .msg-content { background: #111; color: white; border-bottom-right-radius: 4px; }
        .chat-msg.bot .msg-content code { background: #e0e0e0; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
        .typing { display: flex; gap: 4px; padding: 14px; }
        .typing span { width: 8px; height: 8px; background: #999; border-radius: 50%; animation: typing 1.4s infinite; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        #chat-input-area { padding: 12px 16px; border-top: 1px solid #eee; display: flex; gap: 8px; }
        #chat-input { flex: 1; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 0.85rem; font-family: inherit; outline: none; }
        #chat-input:focus { border-color: #111; }
        #chat-send { width: 40px; height: 40px; background: #111; color: white; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        #chat-send:hover { opacity: 0.8; }
        #chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
        #chat-footer { padding: 8px; text-align: center; font-size: 0.65rem; color: #999; background: #fafafa; }
        @media (max-width: 480px) { #ai-chat-widget { bottom: 16px; right: 16px; } #chat-panel { width: calc(100vw - 32px); height: calc(100vh - 100px); bottom: 66px; } }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(widget);

    let isOpen = false, isLoading = false;
    let chatHistory = [];

    const toggle = document.getElementById('chat-toggle');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const messagesEl = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    toggle.addEventListener('click', () => { isOpen = !isOpen; panel.classList.toggle('open', isOpen); if (isOpen) input.focus(); });
    closeBtn.addEventListener('click', () => { isOpen = false; panel.classList.remove('open'); });

    async function sendMessage() {
        const text = input.value.trim();
        if (!text || isLoading) return;

        addMessage('user', text);
        chatHistory.push({ role: 'user', content: text });
        input.value = '';
        
        isLoading = true;
        sendBtn.disabled = true;
        const typingEl = showTyping();

        try {
            const response = await callAI(text);
            typingEl.remove();
            addMessage('bot', response);
            chatHistory.push({ role: 'assistant', content: response });
        } catch (err) {
            typingEl.remove();
            addMessage('bot', err.message || 'Sorry, something went wrong. Please try again.');
            console.error('Chat error:', err);
        }

        isLoading = false;
        sendBtn.disabled = false;
    }

    function addMessage(role, content) {
        const div = document.createElement('div');
        div.className = `chat-msg ${role}`;
        div.innerHTML = `<div class="msg-content">${formatMessage(content)}</div>`;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function formatMessage(text) {
        return text
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'chat-msg bot';
        div.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
    }

    async function callAI(userMessage, retries = 3) {
        // Build context from recent messages
        const context = chatHistory.slice(-4).map(m => 
            m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`
        ).join('\n');

        const prompt = `${SYSTEM_PROMPT}

${context ? context + '\n' : ''}User: ${userMessage}
Assistant:`;

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(
                    'https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            inputs: prompt,
                            parameters: {
                                max_new_tokens: 300,
                                temperature: 0.7,
                                return_full_text: false,
                                do_sample: true
                            }
                        })
                    }
                );

                if (response.status === 503) {
                    // Model is loading, wait and retry
                    const data = await response.json();
                    const waitTime = data.estimated_time || 20;
                    if (i < retries - 1) {
                        await new Promise(r => setTimeout(r, waitTime * 1000));
                        continue;
                    }
                    throw new Error('AI is warming up. Please try again in 30 seconds.');
                }

                if (!response.ok) {
                    throw new Error('Service temporarily unavailable');
                }

                const data = await response.json();
                let text = data[0]?.generated_text || '';
                
                // Clean up response
                text = text.split('User:')[0].split('Assistant:')[0].trim();
                text = text.replace(/^[\s\n]+/, '').replace(/[\s\n]+$/, '');
                
                if (!text) throw new Error('Empty response');
                return text;

            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
})();
