// sorbet.rip - localStorage management system

class StorageManager {
    constructor() {
        this.initializeStorage();
    }

    // initialize storage with default data
    initializeStorage() {
        if (!this.getData('boards')) {
            this.setData('boards', this.getDefaultBoards());
        }
        if (!this.getData('threads')) {
            this.setData('threads', {});
        }
        if (!this.getData('posts')) {
            this.setData('posts', {});
        }
        if (!this.getData('settings')) {
            this.setData('settings', {
                theme: 'dark',
                autoRefresh: true,
                refreshInterval: 30000
            });
        }
        if (!this.getData('stats')) {
            this.setData('stats', {
                totalPosts: 0,
                totalThreads: 0,
                usersOnline: 1
            });
        }
    }

    // get default board configuration
    getDefaultBoards() {
        return {
            'g': {
                name: '/g/',
                title: 'tech',
                description: 'technology discussion, programming, hardware',
                postCount: 0,
                threadCount: 0
            },
            'b': {
                name: '/b/',
                title: 'random',
                description: 'anything goes, the wild west',
                postCount: 0,
                threadCount: 0
            },
            'pol': {
                name: '/pol/',
                title: 'politics',
                description: 'political discussion and debates',
                postCount: 0,
                threadCount: 0
            },
            'rtd': {
                name: '/rtd/',
                title: 'retards',
                description: 'laugh at morons, cringe compilation, people being stupid',
                postCount: 0,
                threadCount: 0
            },
            'cmp': {
                name: '/cmp/',
                title: 'complaints',
                description: 'complaints about life, venting, doomer posting',
                postCount: 0,
                threadCount: 0
            }
        };
    }

    // safe localStorage getter
    getData(key) {
        try {
            const data = localStorage.getItem(`sorbet_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`error reading ${key} from localStorage:`, error);
            return null;
        }
    }

    // safe localStorage setter
    setData(key, value) {
        try {
            localStorage.setItem(`sorbet_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`error writing ${key} to localStorage:`, error);
            // try to clear some space if quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.cleanupStorage();
                try {
                    localStorage.setItem(`sorbet_${key}`, JSON.stringify(value));
                    return true;
                } catch (retryError) {
                    console.error(`retry failed for ${key}:`, retryError);
                    return false;
                }
            }
            return false;
        }
    }

    // cleanup old data to free space
    cleanupStorage() {
        try {
            const threads = this.getData('threads') || {};
            const threadIds = Object.keys(threads);
            
            // remove oldest threads if we have more than 50
            if (threadIds.length > 50) {
                const sortedThreads = threadIds
                    .map(id => ({ id, timestamp: threads[id].timestamp }))
                    .sort((a, b) => a.timestamp - b.timestamp);
                
                const threadsToRemove = sortedThreads.slice(0, threadIds.length - 50);
                threadsToRemove.forEach(thread => {
                    delete threads[thread.id];
                });
                
                this.setData('threads', threads);
            }

            // clear old posts that aren't in any thread
            const posts = this.getData('posts') || {};
            const postIds = Object.keys(posts);
            
            if (postIds.length > 1000) {
                const sortedPosts = postIds
                    .map(id => ({ id, timestamp: posts[id].timestamp }))
                    .sort((a, b) => a.timestamp - b.timestamp);
                
                const postsToRemove = sortedPosts.slice(0, postIds.length - 1000);
                postsToRemove.forEach(post => {
                    delete posts[post.id];
                });
                
                this.setData('posts', posts);
            }
        } catch (error) {
            console.error('error during storage cleanup:', error);
        }
    }

    // thread management
    createThread(boardId, threadData) {
        const threads = this.getData('threads') || {};
        const threadId = this.generateId();
        
        const thread = {
            id: threadId,
            boardId: boardId,
            subject: threadData.subject || '',
            timestamp: Date.now(),
            lastBump: Date.now(),
            postCount: 1,
            ...threadData
        };
        
        threads[threadId] = thread;
        this.setData('threads', threads);
        
        // update board stats
        this.updateBoardStats(boardId, 1, 1);
        
        return threadId;
    }

    getThread(threadId) {
        const threads = this.getData('threads') || {};
        return threads[threadId] || null;
    }

    getThreadsByBoard(boardId) {
        const threads = this.getData('threads') || {};
        return Object.values(threads)
            .filter(thread => thread.boardId === boardId)
            .sort((a, b) => b.lastBump - a.lastBump);
    }

    updateThread(threadId, updates) {
        const threads = this.getData('threads') || {};
        if (threads[threadId]) {
            threads[threadId] = { ...threads[threadId], ...updates };
            this.setData('threads', threads);
        }
    }

    // post management
    createPost(threadId, postData) {
        const posts = this.getData('posts') || {};
        const postId = this.generateId();
        
        const post = {
            id: postId,
            threadId: threadId,
            name: postData.name || 'anonymous',
            comment: postData.comment || '',
            image: postData.image || null,
            timestamp: Date.now(),
            ...postData
        };
        
        posts[postId] = post;
        this.setData('posts', posts);
        
        // update thread
        const thread = this.getThread(threadId);
        if (thread) {
            this.updateThread(threadId, {
                postCount: thread.postCount + 1,
                lastBump: Date.now()
            });
            
            // update board stats
            this.updateBoardStats(thread.boardId, 0, 1);
        }
        
        return postId;
    }

    getPost(postId) {
        const posts = this.getData('posts') || {};
        return posts[postId] || null;
    }

    getPostsByThread(threadId) {
        const posts = this.getData('posts') || {};
        return Object.values(posts)
            .filter(post => post.threadId === threadId)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    // board management
    getBoards() {
        return this.getData('boards') || this.getDefaultBoards();
    }

    getBoard(boardId) {
        const boards = this.getData('boards') || {};
        return boards[boardId] || null;
    }

    updateBoardStats(boardId, threadDelta = 0, postDelta = 0) {
        const boards = this.getData('boards') || {};
        if (boards[boardId]) {
            boards[boardId].threadCount += threadDelta;
            boards[boardId].postCount += postDelta;
            this.setData('boards', boards);
        }
    }

    // stats management
    getStats() {
        return this.getData('stats') || {
            totalPosts: 0,
            totalThreads: 0,
            usersOnline: 1
        };
    }

    updateStats(postDelta = 0, threadDelta = 0) {
        const stats = this.getStats();
        stats.totalPosts += postDelta;
        stats.totalThreads += threadDelta;
        this.setData('stats', stats);
    }

    // utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    // image handling
    async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // export/import functionality
    exportData() {
        const data = {
            boards: this.getData('boards'),
            threads: this.getData('threads'),
            posts: this.getData('posts'),
            settings: this.getData('settings'),
            stats: this.getData('stats'),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sorbet-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.boards) this.setData('boards', data.boards);
            if (data.threads) this.setData('threads', data.threads);
            if (data.posts) this.setData('posts', data.posts);
            if (data.settings) this.setData('settings', data.settings);
            if (data.stats) this.setData('stats', data.stats);
            
            return true;
        } catch (error) {
            console.error('error importing data:', error);
            return false;
        }
    }
}

// create global instance
const storage = new StorageManager();
