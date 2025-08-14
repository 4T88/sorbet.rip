// sorbet.rip - post management and formatting

class PostManager {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // thread form submission
        const threadForm = document.getElementById('thread-form');
        if (threadForm) {
            threadForm.addEventListener('submit', (e) => this.handleThreadSubmit(e));
        }

        // post form submission
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        }

        // image preview
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.accept.includes('image')) {
                this.previewImage(e.target);
            }
        });
    }

    // handle new thread creation
    async handleThreadSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        try {
            const boardId = this.getCurrentBoardId();
            if (!boardId) {
                this.showError('invalid board');
                return;
            }

            const threadData = {
                subject: formData.get('subject') || '',
                name: formData.get('name') || 'anonymous',
                comment: formData.get('comment') || ''
            };

            // handle image upload
            const imageFile = formData.get('image');
            if (imageFile && imageFile.size > 0) {
                if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
                    this.showError('image too large (max 5mb)');
                    return;
                }
                threadData.image = await storage.imageToBase64(imageFile);
            }

            // create thread and first post
            const threadId = storage.createThread(boardId, threadData);
            storage.createPost(threadId, threadData);

            // redirect to thread
            window.location.href = `thread.html?id=${threadId}`;
        } catch (error) {
            console.error('error creating thread:', error);
            this.showError('failed to create thread');
        }
    }

    // handle post reply
    async handlePostSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        try {
            const threadId = this.getCurrentThreadId();
            if (!threadId) {
                this.showError('invalid thread');
                return;
            }

            const postData = {
                name: formData.get('name') || 'anonymous',
                comment: formData.get('comment') || ''
            };

            // handle image upload
            const imageFile = formData.get('image');
            if (imageFile && imageFile.size > 0) {
                if (imageFile.size > 5 * 1024 * 1024) { // 5MB limit
                    this.showError('image too large (max 5mb)');
                    return;
                }
                postData.image = await storage.imageToBase64(imageFile);
            }

            // create post
            storage.createPost(threadId, postData);

            // refresh thread
            this.loadThread(threadId);
            
            // clear form
            form.reset();
            this.hideReplyForm();
            
            this.showSuccess('reply posted');
        } catch (error) {
            console.error('error creating post:', error);
            this.showError('failed to post reply');
        }
    }

    // format post content with 4chan-style formatting
    formatPostContent(content) {
        if (!content) return '';
        
        // green text (lines starting with >)
        content = content.replace(/^>(.*)$/gm, '<span class="green-text">>$1</span>');
        
        // quote links (>>postnumber)
        content = content.replace(/>>(\d+)/g, '<a href="#post-$1" class="quote-link">>>$1</a>');
        
        // bold text (**text**)
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // italic text (*text*)
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // code blocks (`text`)
        content = content.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // convert newlines to <br>
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }

    // create post element
    createPostElement(post, isOP = false) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.id = `post-${post.id}`;
        
        const header = document.createElement('div');
        header.className = 'post-header';
        
        const postNumber = document.createElement('span');
        postNumber.className = 'post-number';
        postNumber.textContent = `#${post.id}`;
        
        const postName = document.createElement('span');
        postName.className = 'post-name';
        postName.textContent = post.name || 'anonymous';
        
        const postTimestamp = document.createElement('span');
        postTimestamp.className = 'post-timestamp';
        postTimestamp.textContent = storage.formatTimestamp(post.timestamp);
        
        header.appendChild(postNumber);
        header.appendChild(postName);
        header.appendChild(postTimestamp);
        
        if (isOP && post.subject) {
            const postSubject = document.createElement('span');
            postSubject.className = 'post-subject';
            postSubject.textContent = post.subject;
            header.appendChild(postSubject);
        }
        
        postDiv.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'post-content';
        content.innerHTML = this.formatPostContent(post.comment);
        postDiv.appendChild(content);
        
        if (post.image) {
            const image = document.createElement('img');
            image.className = 'post-image';
            image.src = post.image;
            image.alt = 'attached image';
            image.onclick = () => this.toggleImage(image);
            postDiv.appendChild(image);
        }
        
        return postDiv;
    }

    // create thread card for catalog view
    createThreadCard(thread, firstPost) {
        const card = document.createElement('div');
        card.className = 'thread-card';
        card.onclick = () => window.location.href = `thread.html?id=${thread.id}`;
        
        const subject = document.createElement('div');
        subject.className = 'thread-subject';
        subject.textContent = thread.subject || 'no subject';
        
        const preview = document.createElement('div');
        preview.className = 'thread-preview';
        preview.innerHTML = this.formatPostContent(firstPost.comment);
        
        const meta = document.createElement('div');
        meta.className = 'thread-meta';
        meta.textContent = `${storage.getPostsByThread(thread.id).length} replies • ${storage.formatTimestamp(thread.timestamp)}`;
        
        card.appendChild(subject);
        card.appendChild(preview);
        card.appendChild(meta);
        
        if (firstPost.image) {
            const image = document.createElement('img');
            image.className = 'thread-image';
            image.src = firstPost.image;
            image.alt = 'thread image';
            card.appendChild(image);
        }
        
        return card;
    }

    // load board catalog
    loadBoard(boardId) {
        // Clean up board ID (remove slashes and get the key)
        const cleanBoardId = boardId.replace(/\//g, '');
        
        const board = storage.getBoard(cleanBoardId);
        if (!board) {
            this.showError('board not found');
            return;
        }

        // update page title
        document.title = `sorbet.rip - ${board.name} ${board.title}`;
        
        // update board title
        const boardTitle = document.getElementById('board-title');
        if (boardTitle) {
            boardTitle.textContent = `${board.name} ${board.title}`;
        }

        // load threads
        const threads = storage.getThreadsByBoard(cleanBoardId);
        const threadsGrid = document.getElementById('threads-grid');
        if (threadsGrid) {
            threadsGrid.innerHTML = '';
            
            if (threads.length === 0) {
                threadsGrid.innerHTML = '<div class="no-threads">no threads yet. be the first to post!</div>';
                return;
            }

            threads.forEach(thread => {
                const posts = storage.getPostsByThread(thread.id);
                const firstPost = posts[0];
                if (firstPost) {
                    const card = this.createThreadCard(thread, firstPost);
                    threadsGrid.appendChild(card);
                }
            });
        }
    }

    // load individual thread
    loadThread(threadId) {
        const thread = storage.getThread(threadId);
        if (!thread) {
            this.showError('thread not found');
            return;
        }

        const board = storage.getBoard(thread.boardId);
        
        // update page title
        document.title = `sorbet.rip - ${thread.subject || 'thread'}`;
        
        // update thread title
        const threadTitle = document.getElementById('thread-title');
        if (threadTitle) {
            threadTitle.textContent = thread.subject || 'no subject';
        }

        // load posts
        const posts = storage.getPostsByThread(threadId);
        const postsList = document.getElementById('posts-list');
        if (postsList) {
            postsList.innerHTML = '';
            
            posts.forEach((post, index) => {
                const isOP = index === 0;
                const postElement = this.createPostElement(post, isOP);
                postsList.appendChild(postElement);
            });
        }
    }

    // utility functions
    getCurrentBoardId() {
        const urlParams = new URLSearchParams(window.location.search);
        const boardId = urlParams.get('board');
        // Clean up board ID (remove slashes and get the key)
        return boardId ? boardId.replace(/\//g, '') : null;
    }

    getCurrentThreadId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        document.body.insertBefore(errorDiv, document.body.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        document.body.insertBefore(successDiv, document.body.firstChild);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // image preview
    previewImage(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // could add preview functionality here
                console.log('image preview loaded');
            };
            reader.readAsDataURL(file);
        }
    }

    // toggle image size
    toggleImage(img) {
        if (img.style.maxHeight === 'none') {
            img.style.maxHeight = '400px';
            img.classList.remove('expanded');
        } else {
            img.style.maxHeight = 'none';
            img.classList.add('expanded');
        }
    }

    // form visibility functions
    showNewThreadForm() {
        const form = document.getElementById('new-thread-form');
        if (form) {
            form.style.display = 'block';
        }
    }

    hideNewThreadForm() {
        const form = document.getElementById('new-thread-form');
        if (form) {
            form.style.display = 'none';
        }
    }

    showReplyForm() {
        const form = document.getElementById('reply-form');
        if (form) {
            form.style.display = 'block';
        }
    }

    hideReplyForm() {
        const form = document.getElementById('reply-form');
        if (form) {
            form.style.display = 'none';
        }
    }

    // refresh functions
    refreshBoard() {
        const boardId = this.getCurrentBoardId();
        if (boardId) {
            this.loadBoard(boardId);
        }
    }

    refreshThread() {
        const threadId = this.getCurrentThreadId();
        if (threadId) {
            this.loadThread(threadId);
        }
    }

    // navigation
    goBack() {
        const boardId = this.getCurrentBoardId();
        if (boardId) {
            window.location.href = `board.html?board=${boardId}`;
        } else {
            window.location.href = 'index.html';
        }
    }
}

// create global instance
const postManager = new PostManager();

// global functions for HTML onclick handlers
function showNewThreadForm() {
    postManager.showNewThreadForm();
}

function hideNewThreadForm() {
    postManager.hideNewThreadForm();
}

function showReplyForm() {
    postManager.showReplyForm();
}

function hideReplyForm() {
    postManager.hideReplyForm();
}

function refreshBoard() {
    postManager.refreshBoard();
}

function refreshThread() {
    postManager.refreshThread();
}

function goBack() {
    postManager.goBack();
}
