const { query } = require('../database/db');

let io;

const setIO = (socketIO) => {
  io = socketIO;
};

const createNotification = async ({ userId, title, message, type = 'info', link = null }) => {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, message, type, link]
    );
    const notification = result.rows[0];

    // Emit real-time notification via Socket.IO
    if (io) {
      io.to(`user:${userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error);
  }
};

const notifyApplicationStatusChange = async (application, jobTitle, applicantId) => {
  const statusMessages = {
    under_review: 'Your application is now under review',
    shortlisted: 'Congratulations! You have been shortlisted',
    interview_scheduled: 'An interview has been scheduled for you',
    interviewed: 'Your interview has been recorded',
    offered: 'You have received a job offer!',
    hired: 'Congratulations! You have been hired!',
    rejected: 'Your application was not successful this time',
    withdrawn: 'Your application has been withdrawn',
  };

  const message = statusMessages[application.status] || `Application status updated to ${application.status}`;

  await createNotification({
    userId: applicantId,
    title: `Application Update: ${jobTitle}`,
    message,
    type: application.status === 'hired' || application.status === 'offered' ? 'success' :
          application.status === 'rejected' ? 'warning' : 'application',
    link: `/applications/${application.id}`
  });
};

module.exports = { setIO, createNotification, notifyApplicationStatusChange };
