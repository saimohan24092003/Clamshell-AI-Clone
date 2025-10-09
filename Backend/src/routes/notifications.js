import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Notifications storage file
const NOTIFICATIONS_FILE = path.join(process.cwd(), 'data', 'notifications.json');

// Ensure notifications file exists
async function ensureNotificationsFile() {
  await fs.ensureDir(path.dirname(NOTIFICATIONS_FILE));
  if (!(await fs.pathExists(NOTIFICATIONS_FILE))) {
    await fs.writeJson(NOTIFICATIONS_FILE, []);
  }
}

// Get all notifications
router.get('/', async (req, res) => {
  try {
    await ensureNotificationsFile();
    const notifications = await fs.readJson(NOTIFICATIONS_FILE);
    res.json({
      success: true,
      notifications: notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to get notifications' });
  }
});

// Add new comment notification
router.post('/comment', async (req, res) => {
  try {
    const { type, page, expertName, comment, timestamp } = req.body;

    await ensureNotificationsFile();
    const notifications = await fs.readJson(NOTIFICATIONS_FILE);

    const newNotification = {
      id: uuidv4(),
      type: type || 'new_comment',
      title: `New Comment from ${expertName}`,
      message: `${expertName} added a comment on ${page}: "${comment}"`,
      page,
      expertName,
      comment,
      read: false,
      createdAt: timestamp || new Date().toISOString()
    };

    notifications.push(newNotification);

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(0, notifications.length - 100);
    }

    await fs.writeJson(NOTIFICATIONS_FILE, notifications, { spaces: 2 });

    console.log(`🔔 New comment notification: ${expertName} commented on ${page}`);

    res.json({
      success: true,
      message: 'Notification created',
      notification: newNotification
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, error: 'Failed to create notification' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    await ensureNotificationsFile();
    const notifications = await fs.readJson(NOTIFICATIONS_FILE);
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);

    if (notificationIndex === -1) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    notifications[notificationIndex].read = true;
    notifications[notificationIndex].readAt = new Date().toISOString();

    await fs.writeJson(NOTIFICATIONS_FILE, notifications, { spaces: 2 });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    await ensureNotificationsFile();
    const notifications = await fs.readJson(NOTIFICATIONS_FILE);

    notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        n.readAt = new Date().toISOString();
      }
    });

    await fs.writeJson(NOTIFICATIONS_FILE, notifications, { spaces: 2 });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
});

// Get notification count
router.get('/count', async (req, res) => {
  try {
    await ensureNotificationsFile();
    const notifications = await fs.readJson(NOTIFICATIONS_FILE);

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      success: true,
      total: notifications.length,
      unread: unreadCount
    });

  } catch (error) {
    console.error('Error getting notification count:', error);
    res.status(500).json({ success: false, error: 'Failed to get count' });
  }
});

export default router;