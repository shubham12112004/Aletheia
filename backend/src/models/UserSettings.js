const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    
    profile: {
      bio: { type: String, default: '' },
      company: { type: String, default: '' },
      occupation: { type: String, default: '' },
      country: { type: String, default: '' },
      timezone: { type: String, default: 'UTC' }
    },
    
    preferences: {
      researchDepth: { type: String, enum: ['quick', 'standard', 'deep'], default: 'standard' },
      defaultModel: { type: String, enum: ['gemini-flash', 'gemini-pro'], default: 'gemini-flash' },
      defaultSearchEngine: { type: String, enum: ['tavily'], default: 'tavily' },
      defaultReportFormat: { type: String, enum: ['executive', 'detailed'], default: 'executive' }
    },
    
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    
    security: {
      twoFactorEnabled: { type: Boolean, default: false }
    },
    
    // In production, these should be securely encrypted before saving
    apiKeys: {
      geminiKey: { type: String, default: '' },
      newsApiKey: { type: String, default: '' },
      fmpKey: { type: String, default: '' },
      tavilyKey: { type: String, default: '' }
    },
    
    analysis: {
      confidenceThreshold: { type: Number, min: 70, max: 95, default: 85 },
      autoSave: { type: Boolean, default: true },
      enableStreaming: { type: Boolean, default: true },
      enableMarketNews: { type: Boolean, default: true },
      enableSwot: { type: Boolean, default: true },
      enableCompetitorAnalysis: { type: Boolean, default: false },
      enableFinancialRatioAnalysis: { type: Boolean, default: true }
    },
    
    runtime: {
      socketStreaming: { type: Boolean, default: true },
      quotaAlerts: { type: Boolean, default: true },
      autoRefresh: { type: Boolean, default: false },
      cacheResults: { type: Boolean, default: true },
      parallelAgents: { type: Boolean, default: true }
    },
    
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      weeklySummary: { type: Boolean, default: false },
      securityAlerts: { type: Boolean, default: true },
      researchAlerts: { type: Boolean, default: true },
      browserNotifications: { type: Boolean, default: false }
    },
    
    workspace: {
      name: { type: String, default: 'My Workspace' },
      description: { type: String, default: '' },
      logo: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserSettings', UserSettingsSchema);
