const Settings = require('../models/Settings');
const Worker = require('../models/Worker');
const Company = require('../models/Company');

exports.getSettings = async (req, res) => {
  try {
    const { id, userType } = req.user;
    
    let [settings] = await Settings.findOrCreate({
      where: { userId: id, userType },
      defaults: { userId: id, userType }
    });

    // Format for frontend
    const formatted = {
      theme: settings.theme,
      notifications: {
        email: settings.notifications_email,
        inApp: settings.notifications_inApp,
        messages: settings.notifications_messages,
        jobs: settings.notifications_jobs
      },
      privacy: {
        profileVisible: settings.privacy_profileVisible,
        allowMessages: settings.privacy_allowMessages,
        searchable: settings.privacy_searchable
      },
      preferences: {
        language: settings.preferences_language,
        emailFrequency: settings.preferences_emailFrequency
      }
    };

    res.json(formatted);
  } catch (error) {
    console.error('GET_SETTINGS_ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { id, userType } = req.user;
    const { theme, notifications, privacy, preferences } = req.body;

    const [settings] = await Settings.findOrCreate({
      where: { userId: id, userType },
      defaults: { userId: id, userType }
    });

    const updateData = {};
    if (theme) updateData.theme = theme;
    
    if (notifications) {
      if (notifications.email !== undefined) updateData.notifications_email = notifications.email;
      if (notifications.inApp !== undefined) updateData.notifications_inApp = notifications.inApp;
      if (notifications.messages !== undefined) updateData.notifications_messages = notifications.messages;
      if (notifications.jobs !== undefined) updateData.notifications_jobs = notifications.jobs;
    }

    if (privacy) {
      if (privacy.profileVisible !== undefined) updateData.privacy_profileVisible = privacy.profileVisible;
      if (privacy.allowMessages !== undefined) updateData.privacy_allowMessages = privacy.allowMessages;
      if (privacy.searchable !== undefined) updateData.privacy_searchable = privacy.searchable;
    }

    if (preferences) {
      if (preferences.language !== undefined) updateData.preferences_language = preferences.language;
      if (preferences.emailFrequency !== undefined) updateData.preferences_emailFrequency = preferences.emailFrequency;
    }

    await settings.update(updateData);

    // Sync back to JSON column in Worker/Company model for backward compatibility
    const model = userType === 'worker' ? Worker : Company;
    const user = await model.findByPk(id);
    if (user) {
      await user.update({ settings: req.body });
    }

    res.json({ message: 'Settings updated successfully', settings: req.body });
  } catch (error) {
    console.error('UPDATE_SETTINGS_ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};
