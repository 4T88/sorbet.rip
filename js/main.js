// sorbet.rip - main application logic

class SorbetApp {
    constructor() {
        this.konamiSequence = [];
        this.konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.loadPageContent();
        this.updateStats();
        this.setupAutoRefresh();
        this.setupKonamiCode();
        this.loadTheme();
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Close theme dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const themeSelector = document.querySelector('.theme-selector');
            const themeDropdown = document.getElementById('theme-dropdown');
            
            if (themeSelector && !themeSelector.contains(e.target) && themeDropdown) {
                themeDropdown.classList.remove('show');
            }
        });
    }

    loadPageContent() {
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index':
                this.loadFrontPage();
                break;
            case 'board':
                this.loadBoardPage();
                break;
            case 'thread':
                this.loadThreadPage();
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        if (filename === '' || filename === 'index.html') return 'index';
        if (filename === 'board.html') return 'board';
        if (filename === 'thread.html') return 'thread';
        return 'index';
    }

    loadFrontPage() {
        this.loadBoards();
        displayMOTD();
    }

    loadBoardPage() {
        const boardId = this.getCurrentBoardId();
        if (boardId) {
            postManager.loadBoard(boardId);
        }
    }

    loadThreadPage() {
        const threadId = this.getCurrentThreadId();
        if (threadId) {
            postManager.loadThread(threadId);
        }
    }

    loadBoards() {
        const boardsGrid = document.getElementById('boards-grid');
        if (!boardsGrid) return;

        const boards = storage.getBoards();
        boardsGrid.innerHTML = '';

        Object.values(boards).forEach(board => {
            const boardCard = this.createBoardCard(board);
            boardsGrid.appendChild(boardCard);
        });
    }

    createBoardCard(board) {
        const card = document.createElement('a');
        card.href = `board.html?board=${board.name.replace('/', '')}`;
        card.className = 'board-card';
        
        card.innerHTML = `
            <div class="board-name">${board.name}</div>
            <div class="board-title">${board.title}</div>
            <div class="board-description">${board.description}</div>
            <div class="board-stats">
                ${board.threadCount} threads, ${board.postCount} posts
            </div>
        `;
        
        return card;
    }

    updateStats() {
        const stats = storage.getStats();
        
        const totalPosts = document.getElementById('total-posts');
        const totalThreads = document.getElementById('total-threads');
        const usersOnline = document.getElementById('users-online');
        
        if (totalPosts) totalPosts.textContent = stats.totalPosts || 0;
        if (totalThreads) totalThreads.textContent = stats.totalThreads || 0;
        if (usersOnline) usersOnline.textContent = Math.floor(Math.random() * 10) + 1;
    }

    setupAutoRefresh() {
        if (this.getCurrentPage() === 'thread') {
            setInterval(() => {
                const threadId = this.getCurrentThreadId();
                if (threadId) {
                    postManager.loadThread(threadId);
                }
            }, 30000); // Refresh every 30 seconds
        }
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    if (this.getCurrentPage() === 'board') {
                        refreshBoard();
                    } else if (this.getCurrentPage() === 'thread') {
                        refreshThread();
                    } else {
                        window.location.reload();
                    }
                    break;
                case 'n':
                    e.preventDefault();
                    if (this.getCurrentPage() === 'board') {
                        showNewThreadForm();
                    } else if (this.getCurrentPage() === 'thread') {
                        showReplyForm();
                    }
                    break;
            }
        } else if (e.key === 'Escape') {
            const newThreadForm = document.getElementById('new-thread-form');
            const replyForm = document.getElementById('reply-form');
            const themeDropdown = document.getElementById('theme-dropdown');
            
            if (newThreadForm && newThreadForm.style.display !== 'none') {
                newThreadForm.style.display = 'none';
            }
            if (replyForm && replyForm.style.display !== 'none') {
                replyForm.style.display = 'none';
            }
            if (themeDropdown && themeDropdown.classList.contains('show')) {
                themeDropdown.classList.remove('show');
            }
        }
    }

    setupKonamiCode() {
        document.addEventListener('keydown', (e) => {
            this.konamiSequence.push(e.code);
            
            if (this.konamiSequence.length > this.konamiCode.length) {
                this.konamiSequence.shift();
            }
            
            if (this.checkKonamiCode()) {
                this.activateKonamiEasterEgg();
            }
        });
    }

    checkKonamiCode() {
        return this.konamiSequence.join(',') === this.konamiCode.join(',');
    }

    activateKonamiEasterEgg() {
        document.body.classList.add('konami-active');
        this.playSound();
        this.showEasterEggMessage();
        
        setTimeout(() => {
            document.body.classList.remove('konami-active');
        }, 5000);
    }

    showEasterEggMessage() {
        const messages = [
            'you found the konami code!',
            'nice one, anon!',
            'the internet never forgets',
            'sage goes in all fields',
            'tfw no gf'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-red);
            color: var(--bg-primary);
            padding: 10px 15px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    playSound() {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('sorbet-theme') || 'dark';
        this.changeTheme(savedTheme);
    }

    changeTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('sorbet-theme', themeName);
        
        // Update active state in dropdown
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-theme') === themeName) {
                option.classList.add('active');
            }
        });
        
        // Close dropdown
        const themeDropdown = document.getElementById('theme-dropdown');
        if (themeDropdown) {
            themeDropdown.classList.remove('show');
        }
    }

    getCurrentBoardId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('board');
    }

    getCurrentThreadId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    showError(message) {
        console.error(message);
        // You can implement a more sophisticated error display here
    }

    showSuccess(message) {
        console.log(message);
        // You can implement a more sophisticated success display here
    }
}

// Global functions for theme management
function toggleThemeDropdown() {
    const dropdown = document.getElementById('theme-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function changeTheme(themeName) {
    if (window.sorbetApp) {
        window.sorbetApp.changeTheme(themeName);
    }
}

// Global functions for navigation
function showCatalog() {
    console.log('catalog view not implemented yet');
}

function toggleTheme() {
    toggleThemeDropdown();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sorbetApp = new SorbetApp();
});

// Add CSS for slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
