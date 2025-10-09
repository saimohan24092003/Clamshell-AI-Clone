/**
 * Expert Comment Widget - Figma-style commenting system for workflow pages
 * Version: 1.0.0
 * Usage: Include this script and call ExpertCommentWidget.init(pageId, sessionId)
 */

class ExpertCommentWidget {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3005/api/comments';
    this.currentSessionId = null;
    this.currentPageId = null;
    this.isAdmin = false;
    this.adminKey = 'admin_delete_key_2024'; // In production, use secure authentication
    this.comments = [];
    this.widgetContainer = null;
    this.isInitialized = false;
  }

  // Initialize the comment widget for a specific page
  async init(pageId, sessionId, options = {}) {
    this.currentPageId = pageId;
    this.currentSessionId = sessionId;
    this.isAdmin = options.isAdmin || false;

    if (this.isInitialized) {
      this.destroy();
    }

    await this.createWidget();
    await this.loadComments();
    this.isInitialized = true;

    console.log(`💬 Expert Comment Widget initialized for ${pageId}`);
  }

  // Create the widget HTML structure
  async createWidget() {
    // Create widget container
    this.widgetContainer = document.createElement('div');
    this.widgetContainer.className = 'expert-comment-widget';
    this.widgetContainer.innerHTML = this.getWidgetHTML();

    // Add to page
    const targetContainer = document.querySelector('.expert-comments-container') || document.body;
    targetContainer.appendChild(this.widgetContainer);

    // Add event listeners
    this.attachEventListeners();

    // Add CSS if not already added
    if (!document.querySelector('#expert-comment-widget-styles')) {
      this.addStyles();
    }
  }

  // Generate the widget HTML
  getWidgetHTML() {
    return `
      <div class="comment-widget-header">
        <div class="comment-header-left">
          <h3 class="comment-widget-title">
            <svg class="comment-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            Expert Feedback
          </h3>
          <span class="comment-count-badge">0</span>
        </div>
        <button class="comment-toggle-btn" title="Toggle comments">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M7 14l5-5 5 5z"/>
          </svg>
        </button>
      </div>

      <div class="comment-widget-body">
        <div class="comment-form-section">
          <div class="expert-info">
            <div class="expert-avatar">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div class="expert-details">
              <input type="text" class="expert-name-input" placeholder="Your name" value="Expert">
              <select class="comment-priority-select">
                <option value="low">Low Priority</option>
                <option value="medium" selected>Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div class="comment-input-container">
            <textarea class="comment-input"
                      placeholder="Share your expert feedback on this step..."
                      rows="3"
                      maxlength="2000"></textarea>
            <div class="comment-input-footer">
              <div class="comment-category-tags">
                <button class="category-tag active" data-category="feedback">💭 Feedback</button>
                <button class="category-tag" data-category="suggestion">💡 Suggestion</button>
                <button class="category-tag" data-category="issue">⚠️ Issue</button>
                <button class="category-tag" data-category="question">❓ Question</button>
              </div>
              <div class="comment-input-actions">
                <span class="char-counter">0/2000</span>
                <button class="add-comment-btn" disabled>Add Comment</button>
              </div>
            </div>
          </div>
        </div>

        <div class="comments-list-section">
          <div class="comments-list">
            <!-- Comments will be loaded here -->
          </div>

          <div class="comments-empty-state" style="display: none;">
            <svg viewBox="0 0 24 24" width="48" height="48" class="empty-state-icon">
              <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V9h2v2zm0-4h-2V5h2v2z"/>
            </svg>
            <p>No expert feedback yet</p>
            <span>Be the first to share insights on this step</span>
          </div>
        </div>
      </div>
    `;
  }

  // Add CSS styles
  addStyles() {
    const style = document.createElement('style');
    style.id = 'expert-comment-widget-styles';
    style.textContent = `
      /* Expert Comment Widget Styles */
      .expert-comment-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        max-width: calc(100vw - 40px);
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        border: 1px solid rgba(0, 0, 0, 0.08);
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        max-height: 70vh;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .expert-comment-widget.collapsed .comment-widget-body {
        display: none;
      }

      .comment-widget-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        cursor: pointer;
      }

      .comment-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .comment-widget-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .comment-icon {
        opacity: 0.9;
      }

      .comment-count-badge {
        background: rgba(255, 255, 255, 0.2);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        min-width: 20px;
        text-align: center;
      }

      .comment-toggle-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .comment-toggle-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .comment-widget-body {
        max-height: calc(70vh - 68px);
        overflow-y: auto;
        background: white;
      }

      .comment-form-section {
        padding: 20px;
        border-bottom: 1px solid #f0f0f0;
      }

      .expert-info {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
      }

      .expert-avatar {
        width: 40px;
        height: 40px;
        border-radius: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .expert-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .expert-name-input {
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 14px;
        font-weight: 500;
        background: #f9f9f9;
      }

      .comment-priority-select {
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 12px;
        background: white;
        color: #666;
      }

      .comment-input-container {
        position: relative;
      }

      .comment-input {
        width: 100%;
        border: 2px solid #f0f0f0;
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.4;
        resize: vertical;
        min-height: 80px;
        font-family: inherit;
        transition: border-color 0.2s;
      }

      .comment-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .comment-input-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
        gap: 16px;
      }

      .comment-category-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .category-tag {
        border: 1px solid #e0e0e0;
        background: white;
        border-radius: 16px;
        padding: 4px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .category-tag:hover {
        border-color: #667eea;
        background: #f8f9ff;
      }

      .category-tag.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      .comment-input-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .char-counter {
        font-size: 12px;
        color: #999;
      }

      .add-comment-btn {
        background: #667eea;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .add-comment-btn:hover:not(:disabled) {
        background: #5a67d8;
        transform: translateY(-1px);
      }

      .add-comment-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
      }

      .comments-list-section {
        min-height: 200px;
      }

      .comments-list {
        padding: 0 20px 20px;
      }

      .comment-item {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        border-left: 4px solid transparent;
        transition: all 0.2s;
      }

      .comment-item:hover {
        background: #f5f5f5;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .comment-item.priority-high {
        border-left-color: #f56565;
      }

      .comment-item.priority-critical {
        border-left-color: #e53e3e;
        background: #fef5f5;
      }

      .comment-item.priority-medium {
        border-left-color: #ed8936;
      }

      .comment-item.priority-low {
        border-left-color: #68d391;
      }

      .comment-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .comment-author {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .comment-author-name {
        font-weight: 600;
        font-size: 14px;
        color: #333;
      }

      .comment-priority-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .comment-priority-badge.high {
        background: #fed7d7;
        color: #c53030;
      }

      .comment-priority-badge.critical {
        background: #feb2b2;
        color: #9b2c2c;
      }

      .comment-priority-badge.medium {
        background: #feebc8;
        color: #c05621;
      }

      .comment-priority-badge.low {
        background: #c6f6d5;
        color: #276749;
      }

      .comment-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .comment-timestamp {
        font-size: 12px;
        color: #999;
      }

      .comment-delete-btn {
        background: #fed7d7;
        color: #c53030;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s;
      }

      .comment-item:hover .comment-delete-btn {
        opacity: 1;
      }

      .comment-delete-btn:hover {
        background: #feb2b2;
      }

      .comment-content {
        color: #444;
        line-height: 1.5;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .comment-category-badge {
        display: inline-flex;
        align-items: center;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 10px;
        background: #edf2f7;
        color: #4a5568;
        font-weight: 500;
      }

      .comments-empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #999;
      }

      .empty-state-icon {
        opacity: 0.3;
        margin-bottom: 16px;
      }

      .comments-empty-state p {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 4px 0;
      }

      .comments-empty-state span {
        font-size: 14px;
        opacity: 0.7;
      }

      /* Loading state */
      .comment-loading {
        text-align: center;
        padding: 20px;
        color: #999;
      }

      /* Mobile responsive */
      @media (max-width: 480px) {
        .expert-comment-widget {
          width: calc(100vw - 20px);
          right: 10px;
          bottom: 10px;
        }

        .comment-category-tags {
          display: none;
        }

        .comment-input-footer {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .comment-input-actions {
          justify-content: space-between;
        }
      }

      /* Animation for new comments */
      @keyframes slideInComment {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .comment-item.new {
        animation: slideInComment 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  // Attach event listeners
  attachEventListeners() {
    const widget = this.widgetContainer;

    // Toggle widget
    const header = widget.querySelector('.comment-widget-header');
    const toggleBtn = widget.querySelector('.comment-toggle-btn');
    header.addEventListener('click', () => this.toggleWidget());

    // Comment input
    const commentInput = widget.querySelector('.comment-input');
    const charCounter = widget.querySelector('.char-counter');
    const addBtn = widget.querySelector('.add-comment-btn');

    commentInput.addEventListener('input', () => {
      const length = commentInput.value.length;
      charCounter.textContent = `${length}/2000`;
      addBtn.disabled = length === 0 || length > 2000;

      if (length > 1800) {
        charCounter.style.color = '#e53e3e';
      } else if (length > 1500) {
        charCounter.style.color = '#ed8936';
      } else {
        charCounter.style.color = '#999';
      }
    });

    // Category tags
    const categoryTags = widget.querySelectorAll('.category-tag');
    categoryTags.forEach(tag => {
      tag.addEventListener('click', () => {
        categoryTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      });
    });

    // Add comment button
    addBtn.addEventListener('click', () => this.addComment());

    // Enter key to add comment (Ctrl+Enter)
    commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !addBtn.disabled) {
        this.addComment();
      }
    });
  }

  // Toggle widget visibility
  toggleWidget() {
    this.widgetContainer.classList.toggle('collapsed');
    const toggleIcon = this.widgetContainer.querySelector('.comment-toggle-btn svg path');
    const isCollapsed = this.widgetContainer.classList.contains('collapsed');

    if (isCollapsed) {
      toggleIcon.setAttribute('d', 'M7 10l5 5 5-5z'); // Down arrow
    } else {
      toggleIcon.setAttribute('d', 'M7 14l5-5 5 5z'); // Up arrow
    }
  }

  // Load comments from API
  async loadComments() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${this.currentSessionId}/${this.currentPageId}`);
      const data = await response.json();

      if (data.success) {
        this.comments = data.comments;
        this.renderComments();
        this.updateCommentCount();
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }

  // Render comments in the UI
  renderComments() {
    const commentsList = this.widgetContainer.querySelector('.comments-list');
    const emptyState = this.widgetContainer.querySelector('.comments-empty-state');

    if (this.comments.length === 0) {
      commentsList.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    // Sort comments by timestamp (newest first)
    const sortedComments = [...this.comments].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    commentsList.innerHTML = sortedComments.map(comment => this.getCommentHTML(comment)).join('');

    // Add delete event listeners for admin
    if (this.isAdmin) {
      this.attachDeleteListeners();
    }
  }

  // Generate HTML for a single comment
  getCommentHTML(comment) {
    const timestamp = new Date(comment.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const adminDeleteBtn = this.isAdmin ?
      `<button class="comment-delete-btn" data-comment-id="${comment.id}" title="Delete comment">Delete</button>` : '';

    return `
      <div class="comment-item priority-${comment.priority}" data-comment-id="${comment.id}">
        <div class="comment-header">
          <div class="comment-author">
            <span class="comment-author-name">${comment.expertName}</span>
            <span class="comment-priority-badge ${comment.priority}">${comment.priority}</span>
          </div>
          <div class="comment-actions">
            <span class="comment-timestamp">${timestamp}</span>
            ${adminDeleteBtn}
          </div>
        </div>
        <div class="comment-content">${this.escapeHtml(comment.content)}</div>
        <span class="comment-category-badge">${this.getCategoryIcon(comment.category)} ${comment.category}</span>
      </div>
    `;
  }

  // Get category icon
  getCategoryIcon(category) {
    const icons = {
      feedback: '💭',
      suggestion: '💡',
      issue: '⚠️',
      question: '❓'
    };
    return icons[category] || '💭';
  }

  // Escape HTML to prevent XSS
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br>");
  }

  // Add new comment
  async addComment() {
    const commentInput = this.widgetContainer.querySelector('.comment-input');
    const expertNameInput = this.widgetContainer.querySelector('.expert-name-input');
    const prioritySelect = this.widgetContainer.querySelector('.comment-priority-select');
    const activeCategory = this.widgetContainer.querySelector('.category-tag.active');
    const addBtn = this.widgetContainer.querySelector('.add-comment-btn');

    const content = commentInput.value.trim();
    if (!content) return;

    // Disable button during request
    addBtn.disabled = true;
    addBtn.textContent = 'Adding...';

    try {
      const response = await fetch(`${this.apiBaseUrl}/${this.currentSessionId}/${this.currentPageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          expertName: expertNameInput.value || 'Expert',
          priority: prioritySelect.value,
          category: activeCategory.dataset.category
        })
      });

      const data = await response.json();

      if (data.success) {
        // Add new comment to local array
        this.comments.unshift(data.comment);

        // Clear form
        commentInput.value = '';
        this.widgetContainer.querySelector('.char-counter').textContent = '0/2000';

        // Re-render comments
        this.renderComments();
        this.updateCommentCount();

        // Scroll to new comment
        setTimeout(() => {
          const newComment = this.widgetContainer.querySelector(`[data-comment-id="${data.comment.id}"]`);
          if (newComment) {
            newComment.classList.add('new');
            newComment.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = 'Add Comment';
    }
  }

  // Attach delete event listeners (admin only)
  attachDeleteListeners() {
    const deleteButtons = this.widgetContainer.querySelectorAll('.comment-delete-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const commentId = btn.dataset.commentId;

        if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
          await this.deleteComment(commentId);
        }
      });
    });
  }

  // Delete comment (admin only)
  async deleteComment(commentId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${this.currentSessionId}/${this.currentPageId}/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminKey: this.adminKey
        })
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local array
        this.comments = this.comments.filter(c => c.id !== commentId);

        // Re-render
        this.renderComments();
        this.updateCommentCount();
      } else {
        alert('Failed to delete comment: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  }

  // Update comment count badge
  updateCommentCount() {
    const badge = this.widgetContainer.querySelector('.comment-count-badge');
    badge.textContent = this.comments.length;

    // Update document title if needed
    const unresolvedCount = this.comments.filter(c => !c.isResolved).length;
    if (unresolvedCount > 0) {
      badge.style.background = 'rgba(245, 101, 101, 0.9)';
    } else {
      badge.style.background = 'rgba(255, 255, 255, 0.2)';
    }
  }

  // Destroy widget
  destroy() {
    if (this.widgetContainer && this.widgetContainer.parentNode) {
      this.widgetContainer.parentNode.removeChild(this.widgetContainer);
    }
    this.widgetContainer = null;
    this.isInitialized = false;
  }

  // Set admin mode
  setAdminMode(isAdmin, adminKey = null) {
    this.isAdmin = isAdmin;
    if (adminKey) {
      this.adminKey = adminKey;
    }

    if (this.isInitialized) {
      this.renderComments(); // Re-render to show/hide delete buttons
    }
  }
}

// Create global instance
window.ExpertCommentWidget = new ExpertCommentWidget();

// Auto-initialize if page has the required meta tags
document.addEventListener('DOMContentLoaded', () => {
  const pageIdMeta = document.querySelector('meta[name="comment-page-id"]');
  const sessionIdMeta = document.querySelector('meta[name="comment-session-id"]');
  const isAdminMeta = document.querySelector('meta[name="comment-admin-mode"]');

  if (pageIdMeta && sessionIdMeta) {
    const pageId = pageIdMeta.getAttribute('content');
    const sessionId = sessionIdMeta.getAttribute('content');
    const isAdmin = isAdminMeta ? isAdminMeta.getAttribute('content') === 'true' : false;

    window.ExpertCommentWidget.init(pageId, sessionId, { isAdmin });
  }
});

console.log('🎨 Expert Comment Widget loaded successfully');