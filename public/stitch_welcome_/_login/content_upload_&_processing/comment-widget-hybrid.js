/**
 * Hybrid Comment Widget - Works with both server and static files
 * Automatically detects if running on server or file:// protocol
 */

class HybridCommentWidget {
    constructor(options = {}) {
        this.apiBase = options.apiBase || window.location.origin;
        this.position = options.position || 'top-right';
        this.commentMode = false;
        this.commentPins = [];
        this.pinCounter = 0;
        this.currentPage = window.location.pathname;
        this.pollInterval = null;

        // Detect if running on server or static file
        this.isServerMode = this.detectServerMode();
        this.storageKey = 'expertComments_' + this.currentPage;

        console.log(`🔄 Comment widget initialized in ${this.isServerMode ? 'SERVER' : 'OFFLINE'} mode`);

        this.init();
    }

    detectServerMode() {
        // Check if we're running on a server (http/https) or static file (file://)
        const protocol = window.location.protocol;
        const hasLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        return (protocol === 'http:' || protocol === 'https:') && hasLocalhost;
    }

    init() {
        this.createStyles();
        this.createWidget();
        this.createOverlay();
        this.createFeedbackPanel();
        this.loadExistingComments();

        if (this.isServerMode) {
            this.startCommentPolling(); // Only poll if on server
        }
    }

    startCommentPolling() {
        // Poll server every 10 seconds for new comments
        this.pollInterval = setInterval(() => {
            this.loadComments();
        }, 10000);
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .comment-widget {
                position: fixed;
                ${this.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
                ${this.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
                z-index: 10000;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                padding: 12px;
                display: flex;
                gap: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .comment-btn {
                background: #f59e0b;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .comment-btn:hover {
                background: #d97706;
                transform: translateY(-1px);
            }

            .comment-btn.active {
                background: #ef4444;
            }

            .comment-btn.active:hover {
                background: #dc2626;
            }

            .comment-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(59, 130, 246, 0.1);
                z-index: 9999;
                cursor: crosshair;
                display: none;
            }

            .comment-pin {
                position: fixed;
                width: 28px;
                height: 28px;
                background: #f59e0b;
                border: 2px solid white;
                border-radius: 50%;
                cursor: pointer;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.3);
                animation: commentPulse 2s infinite;
            }

            @keyframes commentPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .comment-pin:hover {
                transform: scale(1.2);
                background: #d97706;
            }

            .comment-feedback-panel {
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                width: 350px;
                max-height: 80vh;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 10002;
                display: none;
                flex-direction: column;
            }

            .comment-panel-header {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .comment-panel-content {
                padding: 20px;
                overflow-y: auto;
                flex: 1;
            }

            .comment-form {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .comment-input {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
                font-family: inherit;
            }

            .comment-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .comment-textarea {
                resize: vertical;
                min-height: 80px;
            }

            .comment-submit {
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 10px 16px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background 0.2s;
            }

            .comment-submit:hover {
                background: #2563eb;
            }

            .comment-list {
                margin-top: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-height: 300px;
                overflow-y: auto;
            }

            .comment-item {
                padding: 12px;
                background: #f9fafb;
                border-radius: 8px;
                border-left: 3px solid #3b82f6;
            }

            .comment-author {
                font-weight: 600;
                font-size: 13px;
                color: #374151;
                margin-bottom: 4px;
            }

            .comment-text {
                font-size: 14px;
                color: #6b7280;
                line-height: 1.4;
            }

            .comment-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #6b7280;
                padding: 4px;
            }

            .comment-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10003;
                display: none;
                font-size: 14px;
            }

            .comment-counter {
                background: #ef4444;
                color: white;
                border-radius: 12px;
                padding: 2px 8px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 4px;
            }

            .comment-mode-indicator {
                font-size: 11px;
                opacity: 0.7;
                margin-left: 8px;
                background: rgba(0,0,0,0.1);
                padding: 2px 6px;
                border-radius: 10px;
            }
        `;
        document.head.appendChild(style);
    }

    createWidget() {
        this.widget = document.createElement('div');
        this.widget.className = 'comment-widget';

        this.commentBtn = document.createElement('button');
        this.commentBtn.className = 'comment-btn';
        this.commentBtn.innerHTML = '💬 Add Comment';
        this.commentBtn.onclick = () => this.toggleCommentMode();

        this.viewBtn = document.createElement('button');
        this.viewBtn.className = 'comment-btn';
        this.viewBtn.innerHTML = `👁️ View (<span id="comment-count">0</span>)<span class="comment-mode-indicator">${this.isServerMode ? 'LIVE' : 'OFFLINE'}</span>`;
        this.viewBtn.onclick = () => this.toggleFeedbackPanel();

        this.widget.appendChild(this.commentBtn);
        this.widget.appendChild(this.viewBtn);
        document.body.appendChild(this.widget);
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'comment-overlay';
        this.overlay.onclick = (e) => this.addCommentAtPosition(e);
        document.body.appendChild(this.overlay);
    }

    createFeedbackPanel() {
        this.feedbackPanel = document.createElement('div');
        this.feedbackPanel.className = 'comment-feedback-panel';
        this.feedbackPanel.innerHTML = `
            <div class="comment-panel-header">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
                    💬 Comments
                    <span style="font-size: 12px; color: #6b7280;">(${this.isServerMode ? 'Live Sync' : 'Offline Mode'})</span>
                </h3>
                <button class="comment-close" onclick="hybridCommentWidget.closeFeedbackPanel()">×</button>
            </div>
            <div class="comment-panel-content">
                <form class="comment-form" onsubmit="hybridCommentWidget.submitComment(event)">
                    <input type="text" class="comment-input" id="comment-expert-name" placeholder="Your name" required>
                    <input type="email" class="comment-input" id="comment-expert-email" placeholder="Email (optional)">
                    <select class="comment-input" id="comment-rating">
                        <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                        <option value="4">⭐⭐⭐⭐ Good</option>
                        <option value="3">⭐⭐⭐ Average</option>
                        <option value="2">⭐⭐ Poor</option>
                        <option value="1">⭐ Very Poor</option>
                    </select>
                    <textarea class="comment-input comment-textarea" id="comment-text" placeholder="Your feedback..." required></textarea>
                    <button type="submit" class="comment-submit">💬 Add Comment</button>
                </form>
                <div class="comment-list" id="comment-list">
                    <!-- Comments will be loaded here -->
                </div>
            </div>
        `;
        document.body.appendChild(this.feedbackPanel);
    }

    toggleCommentMode() {
        this.commentMode = !this.commentMode;

        if (this.commentMode) {
            this.overlay.style.display = 'block';
            this.commentBtn.classList.add('active');
            this.commentBtn.innerHTML = '✕ Exit Comment Mode';
            document.body.style.cursor = 'crosshair';
        } else {
            this.overlay.style.display = 'none';
            this.commentBtn.classList.remove('active');
            this.commentBtn.innerHTML = '💬 Add Comment';
            document.body.style.cursor = 'default';
        }
    }

    addCommentAtPosition(event) {
        if (!this.commentMode) return;

        const x = event.clientX;
        const y = event.clientY;

        // Create comment pin
        this.pinCounter++;
        const pin = this.createCommentPin(x, y, this.pinCounter);

        // Exit comment mode
        this.toggleCommentMode();

        // Open feedback panel
        this.openFeedbackPanel();
    }

    createCommentPin(x, y, number) {
        const pin = document.createElement('div');
        pin.className = 'comment-pin';
        pin.style.left = (x - 14) + 'px';
        pin.style.top = (y - 14) + 'px';
        pin.textContent = number;
        pin.title = 'Click to view comment';

        pin.onclick = () => {
            this.openFeedbackPanel();
        };

        document.body.appendChild(pin);
        this.commentPins.push({ x, y, number, element: pin });

        return pin;
    }

    toggleFeedbackPanel() {
        const isVisible = this.feedbackPanel.style.display === 'flex';
        if (isVisible) {
            this.closeFeedbackPanel();
        } else {
            this.openFeedbackPanel();
        }
    }

    openFeedbackPanel() {
        this.feedbackPanel.style.display = 'flex';
        this.loadComments();
    }

    closeFeedbackPanel() {
        this.feedbackPanel.style.display = 'none';
    }

    async submitComment(event) {
        event.preventDefault();

        const formData = {
            expertName: document.getElementById('comment-expert-name').value,
            expertEmail: document.getElementById('comment-expert-email').value,
            rating: parseInt(document.getElementById('comment-rating').value),
            comment: document.getElementById('comment-text').value,
            category: 'page-comment',
            contentType: 'click-comment',
            pageUrl: window.location.href,
            pagePath: this.currentPage,
            timestamp: new Date().toISOString()
        };

        if (this.isServerMode) {
            // Try server submission
            try {
                const response = await fetch(`${this.apiBase}/api/feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    this.showToast('Comment added to server! 🌐');
                    this.clearForm();
                    this.loadComments();
                    this.updateCommentCount();

                    // Send notification to backend
                    this.sendNotification(formData);
                    return;
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('Server submission failed, falling back to localStorage:', error);
                this.showToast('Server unavailable, saving offline 📱', 'warning');
            }
        }

        // Fallback to localStorage (for offline mode or server failure)
        this.saveCommentToLocalStorage(formData);
        this.showToast('Comment saved offline! 💾');
        this.clearForm();
        this.loadComments();
        this.updateCommentCount();
    }

    saveCommentToLocalStorage(commentData) {
        try {
            const existingComments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            const newComment = {
                ...commentData,
                id: Date.now().toString(),
                createdAt: commentData.timestamp
            };
            existingComments.push(newComment);
            localStorage.setItem(this.storageKey, JSON.stringify(existingComments));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    async sendNotification(commentData) {
        if (!this.isServerMode) return;

        try {
            await fetch(`${this.apiBase}/api/notifications/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'new_comment',
                    page: commentData.pagePath,
                    expertName: commentData.expertName,
                    comment: commentData.comment.substring(0, 100) + '...',
                    timestamp: commentData.timestamp
                })
            });
        } catch (error) {
            console.log('Notification failed:', error);
        }
    }

    clearForm() {
        document.getElementById('comment-expert-name').value = '';
        document.getElementById('comment-expert-email').value = '';
        document.getElementById('comment-text').value = '';
        document.getElementById('comment-rating').value = '5';
    }

    async loadComments() {
        if (this.isServerMode) {
            // Try loading from server
            try {
                const response = await fetch(`${this.apiBase}/api/feedback?page=${encodeURIComponent(this.currentPage)}`);
                const data = await response.json();

                if (data.success) {
                    this.displayComments(data.feedback, 'server');
                    this.updateCommentCount(data.feedback.length);
                    return;
                }
            } catch (error) {
                console.error('Server comment loading failed, loading from localStorage:', error);
            }
        }

        // Fallback to localStorage
        this.loadCommentsFromLocalStorage();
    }

    loadCommentsFromLocalStorage() {
        try {
            const comments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            this.displayComments(comments, 'local');
            this.updateCommentCount(comments.length);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.displayComments([], 'error');
        }
    }

    displayComments(comments, source) {
        const container = document.getElementById('comment-list');

        if (comments.length === 0) {
            const sourceText = source === 'server' ? 'server' : source === 'local' ? 'offline storage' : '';
            container.innerHTML = `<p style="color: #6b7280; text-align: center; padding: 20px;">No comments yet ${sourceText ? `(checked ${sourceText})` : ''}</p>`;
            return;
        }

        const sourceIcon = source === 'server' ? '🌐' : '💾';

        container.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-author">
                    ${sourceIcon} ${comment.expertName}
                    <span style="color: #f59e0b;">${'⭐'.repeat(comment.rating)}</span>
                </div>
                <div class="comment-text">${comment.comment}</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
                    ${new Date(comment.createdAt).toLocaleDateString()} ${new Date(comment.createdAt).toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    updateCommentCount(count) {
        const counter = document.getElementById('comment-count');
        if (counter) {
            counter.textContent = count || this.commentPins.length;
        }
    }

    async loadExistingComments() {
        await this.loadComments();
    }

    showToast(message, type = 'success') {
        // Create toast if it doesn't exist
        let toast = document.querySelector('.comment-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'comment-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.background = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981';
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    destroy() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }
}

// Auto-initialize when script loads
let hybridCommentWidget;
document.addEventListener('DOMContentLoaded', () => {
    hybridCommentWidget = new HybridCommentWidget({
        apiBase: "https://clamshell-backend-o7g90prgf-mohammed-asrafs-projects.vercel.app"
    });
    window.HybridCommentWidget = HybridCommentWidget;
    window.hybridCommentWidget = hybridCommentWidget;
});