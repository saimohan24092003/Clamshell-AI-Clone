import express from 'express';
import { dataService } from '../services/dataService.js';

const router = express.Router();

// Get comments for a specific page
router.get('/:sessionId/:pageId', async (req, res) => {
  try {
    const { sessionId, pageId } = req.params;

    console.log(`📝 Getting comments for ${pageId} in session ${sessionId}`);

    const comments = await dataService.getPageComments(sessionId, pageId);

    res.json({
      success: true,
      pageId,
      sessionId,
      comments,
      totalComments: comments.length
    });

  } catch (error) {
    console.error('Error getting page comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get page comments',
      error: error.message
    });
  }
});

// Add a new comment to a page
router.post('/:sessionId/:pageId', async (req, res) => {
  try {
    const { sessionId, pageId } = req.params;
    const { content, expertName, expertEmail, priority, category } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Comment content must be less than 2000 characters'
      });
    }

    console.log(`💬 Adding comment to ${pageId} in session ${sessionId}`);

    const commentData = {
      content: content.trim(),
      expertName: expertName || 'Expert',
      expertEmail: expertEmail || 'expert@company.com',
      priority: priority || 'medium',
      category: category || 'feedback'
    };

    const newComment = await dataService.addPageComment(sessionId, pageId, commentData);

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment,
      pageId,
      sessionId
    });

  } catch (error) {
    console.error('Error adding page comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// Delete a comment (Admin only)
router.delete('/:sessionId/:pageId/:commentId', async (req, res) => {
  try {
    const { sessionId, pageId, commentId } = req.params;
    const { adminKey } = req.body;

    // Simple admin key check - in production, use proper authentication
    const isAdmin = adminKey === 'admin_delete_key_2024';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required to delete comments'
      });
    }

    console.log(`🗑️ Admin deleting comment ${commentId} from ${pageId}`);

    await dataService.deletePageComment(sessionId, pageId, commentId, true);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      commentId,
      pageId,
      sessionId
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
});

// Update comment status (resolve/unresolve)
router.patch('/:sessionId/:pageId/:commentId/status', async (req, res) => {
  try {
    const { sessionId, pageId, commentId } = req.params;
    const { isResolved } = req.body;

    console.log(`✅ Updating comment ${commentId} status to ${isResolved ? 'resolved' : 'unresolved'}`);

    await dataService.updateCommentStatus(sessionId, pageId, commentId, isResolved);

    res.json({
      success: true,
      message: `Comment marked as ${isResolved ? 'resolved' : 'unresolved'}`,
      commentId,
      isResolved
    });

  } catch (error) {
    console.error('Error updating comment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment status',
      error: error.message
    });
  }
});

// Get all comments for a session (overview)
router.get('/overview/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    console.log(`📊 Getting all comments overview for session ${sessionId}`);

    const allComments = await dataService.getAllCommentsForSession(sessionId);

    // Calculate summary statistics
    let totalComments = 0;
    let unresolved = 0;
    let highPriority = 0;

    Object.values(allComments).forEach(pageData => {
      totalComments += pageData.comments.length;
      pageData.comments.forEach(comment => {
        if (!comment.isResolved) unresolved++;
        if (comment.priority === 'high' || comment.priority === 'critical') highPriority++;
      });
    });

    res.json({
      success: true,
      sessionId,
      pageComments: allComments,
      summary: {
        totalComments,
        unresolvedComments: unresolved,
        highPriorityComments: highPriority,
        pagesWithComments: Object.keys(allComments).length
      }
    });

  } catch (error) {
    console.error('Error getting comments overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comments overview',
      error: error.message
    });
  }
});

export default router;