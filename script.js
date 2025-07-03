// Main chatbot functionality
class MCPChatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.isTyping = false;
        
        this.initializeEventListeners();
        this.loadChatHistory();
    }
    
    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        this.userInput.addEventListener('input', () => this.handleInputChange());
    }
    
    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }
    
    handleInputChange() {
        const hasText = this.userInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isTyping;
    }
    
    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.handleInputChange();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate response
        try {
            const response = await this.generateResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error while processing your question. Please try again.', 'bot');
            console.error('Error generating response:', error);
        }
        
        this.saveChatHistory();
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (sender === 'bot') {
            messageContent.innerHTML = this.formatBotMessage(content);
        } else {
            messageContent.textContent = content;
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatBotMessage(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Bullet points
            .replace(/^• (.+)$/gm, '<li>$1</li>')
            // Line breaks
            .replace(/\n/g, '<br>');
        
        // Wrap consecutive list items in ul tags
        formatted = formatted.replace(/(<li>.*?<\/li>(?:<br>)*)+/g, (match) => {
            const items = match.replace(/<br>/g, '');
            return `<ul>${items}</ul>`;
        });
        
        return formatted;
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.handleInputChange();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'message-content';
        typingContent.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingContent);
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.handleInputChange();
        
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    async generateResponse(userMessage) {
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Search knowledge base
        const searchResults = searchKnowledge(userMessage);
        
        if (searchResults.length > 0) {
            const bestMatch = searchResults[0];
            
            // If it's a very good match, return the full content
            if (bestMatch.score > 50) {
                return this.formatKnowledgeResponse(bestMatch);
            }
        }
        
        // Generate contextual response based on keywords
        return this.generateContextualResponse(userMessage, searchResults);
    }
    
    formatKnowledgeResponse(knowledgeItem) {
        return `**${knowledgeItem.title}**\n\n${knowledgeItem.content}`;
    }
    
    generateContextualResponse(userMessage, searchResults) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Greeting responses
        if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
            return `Hello! I'm your MCP (Model Context Protocol) expert assistant. I can help you with:\n\n• Understanding MCP concepts and architecture\n• Implementation guidance and code examples\n• Best practices and security considerations\n• Troubleshooting common issues\n• Performance optimization tips\n\nWhat specific aspect of MCP would you like to learn about?`;
        }
        
        // Thank you responses
        if (lowerMessage.match(/(thank|thanks)/)) {
            return `You're welcome! I'm here to help with any MCP-related questions. Feel free to ask about implementation details, best practices, troubleshooting, or any other MCP topics.`;
        }
        
        // Help requests
        if (lowerMessage.match(/(help|assist|guide)/)) {
            return `I'd be happy to help! Here are some areas I can assist you with:\n\n**Core Topics:**\n• What is MCP and how does it work?\n• MCP architecture and components\n• Server and client implementation\n• Configuration and setup\n\n**Advanced Topics:**\n• Security best practices\n• Performance optimization\n• Scaling strategies\n• Troubleshooting common issues\n\nWhat specific topic would you like to explore?`;
        }
        
        // If we have partial matches, provide a helpful response
        if (searchResults.length > 0) {
            const topResults = searchResults.slice(0, 3);
            let response = `I found some relevant information that might help:\n\n`;
            
            topResults.forEach((result, index) => {
                response += `**${index + 1}. ${result.title}**\n`;
                // Add a brief excerpt
                const excerpt = result.content.substring(0, 150).replace(/\n/g, ' ') + '...';
                response += `${excerpt}\n\n`;
            });
            
            response += `Would you like me to elaborate on any of these topics? You can also try asking more specific questions about MCP implementation, troubleshooting, or best practices.`;
            return response;
        }
        
        // Default response for unrecognized queries
        return `I'd be happy to help with your MCP question! However, I need a bit more context to provide the most relevant information.\n\n**Here are some ways you can ask:**\n• "What is MCP?" - for basic concepts\n• "How to implement an MCP server?" - for implementation guidance\n• "MCP best practices" - for recommendations\n• "MCP troubleshooting" - for problem-solving\n• "MCP security" - for security considerations\n\nYou can also click on the quick topic buttons in the sidebar for common questions. What specific aspect of MCP would you like to learn about?`;
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    clearChat() {
        // Keep only the initial bot message
        const messages = this.chatMessages.querySelectorAll('.message');
        for (let i = 1; i < messages.length; i++) {
            messages[i].remove();
        }
        
        localStorage.removeItem('mcp-chat-history');
    }
    
    saveChatHistory() {
        const messages = [];
        const messageElements = this.chatMessages.querySelectorAll('.message:not(.typing-message)');
        
        messageElements.forEach(element => {
            const isUser = element.classList.contains('user-message');
            const content = element.querySelector('.message-content').textContent;
            messages.push({ sender: isUser ? 'user' : 'bot', content });
        });
        
        localStorage.setItem('mcp-chat-history', JSON.stringify(messages));
    }
    
    loadChatHistory() {
        const history = localStorage.getItem('mcp-chat-history');
        if (history) {
            const messages = JSON.parse(history);
            // Skip the first message (initial bot greeting) and load the rest
            messages.slice(1).forEach(message => {
                this.addMessage(message.content, message.sender);
            });
        }
    }
    
    askQuestion(question) {
        this.userInput.value = question;
        this.sendMessage();
    }
}

// Global functions for HTML event handlers
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function sendMessage() {
    if (window.chatbot) {
        window.chatbot.sendMessage();
    }
}

function clearChat() {
    if (window.chatbot) {
        if (confirm('Are you sure you want to clear the chat history?')) {
            window.chatbot.clearChat();
        }
    }
}

function askQuestion(question) {
    if (window.chatbot) {
        window.chatbot.askQuestion(question);
    }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new MCPChatbot();
    
    // Add some interactive features
    addInteractiveFeatures();
});

function addInteractiveFeatures() {
    // Add hover effects to topic buttons
    const topicButtons = document.querySelectorAll('.topic-btn');
    topicButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('userInput').focus();
        }
        
        // Escape to clear input
        if (e.key === 'Escape') {
            document.getElementById('userInput').value = '';
            document.getElementById('userInput').blur();
        }
    });
    
    // Add auto-resize to input
    const userInput = document.getElementById('userInput');
    userInput.addEventListener('input', () => {
        // Auto-expand input for longer messages
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
    });
    
    // Add copy functionality to code blocks
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'CODE' || e.target.closest('pre')) {
            const codeElement = e.target.tagName === 'CODE' ? e.target : e.target.querySelector('code');
            if (codeElement) {
                navigator.clipboard.writeText(codeElement.textContent).then(() => {
                    // Show temporary feedback
                    const originalText = codeElement.textContent;
                    codeElement.textContent = 'Copied!';
                    setTimeout(() => {
                        codeElement.textContent = originalText;
                    }, 1000);
                });
            }
        }
    });
}

// Add some sample questions for demonstration
const sampleQuestions = [
    "What is MCP and why should I use it?",
    "How do I implement a basic MCP server?",
    "What are the security considerations for MCP?",
    "How can I optimize MCP server performance?",
    "What's the difference between MCP and REST APIs?",
    "How do I troubleshoot MCP connection issues?",
    "What are MCP best practices?",
    "How do I scale an MCP server?"
];

// Add a function to get random sample questions
function getRandomSampleQuestion() {
    return sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MCPChatbot, sampleQuestions };
}