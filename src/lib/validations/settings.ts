import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(160, 'Bio must be under 160 characters').optional(),
  company: z.string().max(100).optional(),
  occupation: z.string().max(100).optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const workspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  description: z.string().max(300).optional(),
});

export const preferencesSchema = z.object({
  researchDepth: z.enum(['quick', 'standard', 'deep']),
  defaultModel: z.enum(['gemini-flash', 'gemini-pro']),
  defaultSearchEngine: z.enum(['tavily']),
  defaultReportFormat: z.enum(['executive', 'detailed']),
});

export const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  weeklySummary: z.boolean(),
  securityAlerts: z.boolean(),
  researchAlerts: z.boolean(),
  browserNotifications: z.boolean(),
});

export const themeSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']),
});

export const securitySchema = z.object({
  twoFactorEnabled: z.boolean(),
});

export const apiKeysSchema = z.object({
  geminiKey: z.string().optional(),
  newsApiKey: z.string().optional(),
  fmpKey: z.string().optional(),
  tavilyKey: z.string().optional(),
});

export const runtimeSchema = z.object({
  socketStreaming: z.boolean(),
  quotaAlerts: z.boolean(),
  autoRefresh: z.boolean(),
  cacheResults: z.boolean(),
  parallelAgents: z.boolean(),
});

export const analysisSchema = z.object({
  confidenceThreshold: z.number().min(70).max(95),
  autoSave: z.boolean(),
  enableStreaming: z.boolean(),
  enableMarketNews: z.boolean(),
  enableSwot: z.boolean(),
  enableCompetitorAnalysis: z.boolean(),
  enableFinancialRatioAnalysis: z.boolean(),
});
