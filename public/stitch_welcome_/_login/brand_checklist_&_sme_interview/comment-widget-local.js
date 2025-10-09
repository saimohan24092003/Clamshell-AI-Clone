/**
 * Local Comment Widget - Works with file:// protocol
 * Stores comments in localStorage for offline use
 */

class LocalCommentWidget {
    constructor(options = {}) {
        this.position = options.position || 'top-right';
        this.commentMode = false;
        this.commentPins = [];
        this.pinCounter = 0;
        this.storageKey = 'expertComments_' + window.location.pathname;

        this.init();
    }

    init() {
        this.createStyles();
        this.createWidget();
        this.createOverlay();
        this.createFeedbackPanel();
        this.loadExistingComments();
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

            .export-btn {
                background: #10b981;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 6px 12px;
                cursor: pointer;
                font-size: 12px;
                margin-top: 10px;
            }

            .export-btn:hover {
                background: #059669;
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
        this.viewBtn.innerHTML = '👁️ View (<span id="comment-count">0</span>)';
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
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">💬 Expert Comments</h3>
                <button class="comment-close" onclick="localCommentWidget.closeFeedbackPanel()">×</button>
            </div>
            <div class="comment-panel-content">
                <form class="comment-form" onsubmit="localCommentWidget.submitComment(event)">
                    <input type="text" class="comment-input" id="local-comment-expert-name" placeholder="Your name *" required>
                    <input type="email" class="comment-input" id="local-comment-expert-email" placeholder="Email (optional)">
                    <select class="comment-input" id="local-comment-rating">
                        <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                        <option value="4">⭐⭐⭐⭐ Good (4/5)</option>
                        <option value="3">⭐⭐⭐ Average (3/5)</option>
                        <option value="2">⭐⭐ Poor (2/5)</option>
                        <option value="1">⭐ Very Poor (1/5)</option>
                    </select>
                    <textarea class="comment-input comment-textarea" id="local-comment-text" placeholder="Your expert feedback... *" required></textarea>
                    <textarea class="comment-input" id="local-comment-suggestions" placeholder="Improvement suggestions (optional)"></textarea>
                    <button type="submit" class="comment-submit">💬 Add Expert Comment</button>
                </form>
                <button class="export-btn" onclick="localCommentWidget.exportComments()">📋 Export All Comments</button>
                <div class="comment-list" id="local-comment-list">
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
        pin.title = 'Expert Comment #' + number + ' - Click to view';

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

    submitComment(event) {
        event.preventDefault();

        const formData = {
            id: Date.now().toString(),
            expertName: document.getElementById('local-comment-expert-name').value,
            expertEmail: document.getElementById('local-comment-expert-email').value,
            rating: parseInt(document.getElementById('local-comment-rating').value),
            comment: document.getElementById('local-comment-text').value,
            suggestions: document.getElementById('local-comment-suggestions').value,
            category: 'expert-review',
            pageUrl: window.location.href,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        try {
            const existingComments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            existingComments.push(formData);
            localStorage.setItem(this.storageKey, JSON.stringify(existingComments));

            this.showToast('✅ Expert comment saved successfully!');
            this.clearForm();
            this.loadComments();
            this.updateCommentCount();
        } catch (error) {
            console.error('Error saving comment:', error);
            alert('Error saving comment. Please try again.');
        }
    }

    clearForm() {
        document.getElementById('local-comment-expert-name').value = '';
        document.getElementById('local-comment-expert-email').value = '';
        document.getElementById('local-comment-text').value = '';
        document.getElementById('local-comment-suggestions').value = '';
        document.getElementById('local-comment-rating').value = '5';
    }

    loadComments() {
        try {
            const comments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            this.displayComments(comments);
            this.updateCommentCount(comments.length);
        } catch (error) {
            console.error('Error loading comments:', error);
            this.displayComments([]);
        }
    }

    displayComments(comments) {
        const container = document.getElementById('local-comment-list');

        if (comments.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px; font-size: 14px;">No expert comments yet</p>';
            return;
        }

        container.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-author">
                    ${comment.expertName}
                    ${comment.expertEmail ? `<span style="color: #6b7280; font-weight: normal;">(${comment.expertEmail})</span>` : ''}
                    <div style="float: right;">
                        <span style="color: #f59e0b;">${'⭐'.repeat(comment.rating)}</span>
                        <span style="color: #6b7280; font-size: 12px;">${comment.rating}/5</span>
                    </div>
                </div>
                <div class="comment-text" style="margin: 8px 0;">
                    <strong>Feedback:</strong><br>
                    ${comment.comment}
                </div>
                ${comment.suggestions ? `
                    <div class="comment-text" style="background: #f0fdf4; padding: 8px; border-radius: 4px; border-left: 3px solid #22c55e; margin-top: 8px;">
                        <strong>💡 Suggestions:</strong><br>
                        ${comment.suggestions}
                    </div>
                ` : ''}
                <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">
                    📅 ${new Date(comment.createdAt).toLocaleDateString()} at ${new Date(comment.createdAt).toLocaleTimeString()}
                </div>
            </div>
        `).join('');
    }

    updateCommentCount(count) {
        const counter = document.getElementById('comment-count');
        if (counter) {
            const totalCount = count !== undefined ? count : this.getStoredCommentsCount();
            counter.textContent = totalCount;
        }
    }

    getStoredCommentsCount() {
        try {
            const comments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            return comments.length;
        } catch {
            return 0;
        }
    }

    loadExistingComments() {
        this.loadComments();
    }

    exportComments() {
        try {
            const comments = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

            if (comments.length === 0) {
                alert('No comments to export');
                return;
            }

            const csv = this.convertToCSV(comments);
            const filename = `expert-comments-${new Date().toISOString().split('T')[0]}.csv`;
            this.downloadFile(csv, filename, 'text/csv');

            this.showToast('📋 Comments exported successfully!');
        } catch (error) {
            console.error('Error exporting comments:', error);
            alert('Error exporting comments');
        }
    }

    convertToCSV(comments) {
        const headers = ['Expert Name', 'Email', 'Rating', 'Feedback', 'Suggestions', 'Page URL', 'Date', 'Time'];
        const rows = comments.map(comment => [
            comment.expertName,
            comment.expertEmail || '',
            comment.rating,
            `"${comment.comment.replace(/"/g, '""')}"`,
            `"${(comment.suggestions || '').replace(/"/g, '""')}"`,
            comment.pageUrl,
            new Date(comment.createdAt).toLocaleDateString(),
            new Date(comment.createdAt).toLocaleTimeString()
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\\n');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showToast(message) {
        // Create toast if it doesn't exist
        let toast = document.querySelector('.comment-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'comment-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

// Auto-initialize when script loads
let localCommentWidget;
document.addEventListener('DOMContentLoaded', () => {
    localCommentWidget = new LocalCommentWidget();
});

// Expose globally
window.LocalCommentWidget = LocalCommentWidget;
window.localCommentWidget = localCommentWidget;