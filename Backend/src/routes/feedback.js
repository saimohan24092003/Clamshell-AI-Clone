import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Feedback storage file
const FEEDBACK_FILE = path.join(process.cwd(), 'data', 'feedback.json');

// Ensure feedback file exists
async function ensureFeedbackFile() {
  await fs.ensureDir(path.dirname(FEEDBACK_FILE));
  if (!(await fs.pathExists(FEEDBACK_FILE))) {
    await fs.writeJson(FEEDBACK_FILE, []);
  }
}

// Get feedback (optionally filtered by page)
router.get('/', async (req, res) => {
  try {
    await ensureFeedbackFile();
    let feedback = await fs.readJson(FEEDBACK_FILE);

    // Filter by page if provided
    const { page } = req.query;
    if (page) {
      feedback = feedback.filter(f => f.pagePath === page || f.pageUrl?.includes(page));
    }

    res.json({
      success: true,
      feedback: feedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to get feedback' });
  }
});

// Add new feedback
router.post('/', async (req, res) => {
  try {
    const {
      expertName,
      expertEmail,
      rating,
      category,
      comment,
      suggestions,
      contentType,
      contentId,
      pageUrl,
      pagePath,
      timestamp
    } = req.body;

    // Validate required fields
    if (!expertName || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Expert name and comment are required'
      });
    }

    await ensureFeedbackFile();
    const feedback = await fs.readJson(FEEDBACK_FILE);

    const newFeedback = {
      id: uuidv4(),
      expertName: expertName.trim(),
      expertEmail: expertEmail?.trim() || '',
      rating: parseInt(rating) || 5,
      category: category || 'general',
      comment: comment.trim(),
      suggestions: suggestions?.trim() || '',
      contentType: contentType || 'general',
      contentId: contentId || null,
      pageUrl: pageUrl || '',
      pagePath: pagePath || '',
      createdAt: timestamp || new Date().toISOString(),
      status: 'new'
    };

    feedback.push(newFeedback);
    await fs.writeJson(FEEDBACK_FILE, feedback, { spaces: 2 });

    res.json({
      success: true,
      message: 'Feedback added successfully',
      feedback: newFeedback
    });

  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to add feedback' });
  }
});

// Add reply to feedback
router.post('/:feedbackId/reply', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { replyText, replierName } = req.body;

    if (!replyText || !replierName) {
      return res.status(400).json({
        success: false,
        error: 'Reply text and replier name are required'
      });
    }

    await ensureFeedbackFile();
    const feedback = await fs.readJson(FEEDBACK_FILE);
    const feedbackIndex = feedback.findIndex(f => f.id === feedbackId);

    if (feedbackIndex === -1) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    if (!feedback[feedbackIndex].replies) {
      feedback[feedbackIndex].replies = [];
    }

    const reply = {
      id: uuidv4(),
      text: replyText.trim(),
      replierName: replierName.trim(),
      createdAt: new Date().toISOString()
    };

    feedback[feedbackIndex].replies.push(reply);
    await fs.writeJson(FEEDBACK_FILE, feedback, { spaces: 2 });

    res.json({
      success: true,
      message: 'Reply added successfully',
      reply
    });

  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ success: false, error: 'Failed to add reply' });
  }
});

// Update feedback status
router.patch('/:feedbackId/status', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'in-progress', 'resolved', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: ' + validStatuses.join(', ')
      });
    }

    await ensureFeedbackFile();
    const feedback = await fs.readJson(FEEDBACK_FILE);
    const feedbackIndex = feedback.findIndex(f => f.id === feedbackId);

    if (feedbackIndex === -1) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    feedback[feedbackIndex].status = status;
    feedback[feedbackIndex].updatedAt = new Date().toISOString();

    await fs.writeJson(FEEDBACK_FILE, feedback, { spaces: 2 });

    res.json({
      success: true,
      message: 'Status updated successfully',
      feedback: feedback[feedbackIndex]
    });

  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// Delete feedback
router.delete('/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;

    await ensureFeedbackFile();
    const feedback = await fs.readJson(FEEDBACK_FILE);
    const filteredFeedback = feedback.filter(f => f.id !== feedbackId);

    if (feedback.length === filteredFeedback.length) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    await fs.writeJson(FEEDBACK_FILE, filteredFeedback, { spaces: 2 });

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to delete feedback' });
  }
});

// Get feedback statistics
router.get('/stats', async (req, res) => {
  try {
    await ensureFeedbackFile();
    const feedback = await fs.readJson(FEEDBACK_FILE);

    const stats = {
      total: feedback.length,
      avgRating: feedback.length > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : 0,
      categories: {},
      statuses: {}
    };

    feedback.forEach(f => {
      stats.categories[f.category] = (stats.categories[f.category] || 0) + 1;
      stats.statuses[f.status] = (stats.statuses[f.status] || 0) + 1;
    });

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get statistics' });
  }
});

export default router;
