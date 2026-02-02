// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Function to scroll to contact section
function scrollToContact() {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
        contactSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Contact form submission handler
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        const res = await fetch('/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, subject, message })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            alert(`Thank you, ${name}! Your message has been sent. We'll get back to you at ${email} soon.`);
            this.reset();
        } else {
            alert('Sorry, there was a problem sending your message. Please try again later.');
        }
    } catch (err) {
        alert('Sorry, there was a problem sending your message. Please try again later.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Add active class to navigation links on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add entrance animation when elements come into view
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Chat Widget
const CHAT_API_URL = '/chat';
let chatHistory = [];

function toggleChat() {
    const win = document.getElementById('chat-window');
    win.classList.toggle('chat-hidden');
    if (!win.classList.contains('chat-hidden')) {
        document.getElementById('chat-input').focus();
    }
}

function appendChatMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendChatMessage('user', text);

    const assistantDiv = appendChatMessage('assistant', '');
    let fullResponse = '';

    try {
        const res = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: chatHistory })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            assistantDiv.textContent = err?.error || 'Something went wrong. Please try again.';
            return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;
                    if (data.startsWith('[ERROR]')) {
                        assistantDiv.textContent = data.slice(8);
                        return;
                    }
                    fullResponse += data;
                    assistantDiv.textContent = fullResponse;
                }
            }
            document.getElementById('chat-messages').scrollTop =
                document.getElementById('chat-messages').scrollHeight;
        }

        chatHistory.push({ role: 'user', content: text });
        chatHistory.push({ role: 'assistant', content: fullResponse });
    } catch (err) {
        assistantDiv.textContent = 'Unable to connect to the assistant. Please try again later.';
    }
}

document.getElementById('chat-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendChatMessage();
});

// Mobile menu toggle (for future enhancement)
console.log('AccMate web app loaded successfully!');