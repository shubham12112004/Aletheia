const { z } = require('zod');
const integrationService = require('../services/integrationService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const companySchema = z.object({ company: z.string().min(1) });
const symbolSchema = z.object({ symbol: z.string().min(1) });
const promptSchema = z.object({ prompt: z.string().min(1) });

const searchCompany = asyncHandler(async (req, res) => {
  const { company } = companySchema.parse(req.query);
  const data = await integrationService.searchCompany(company);
  return success(res, data);
});

const getCompanyProfile = asyncHandler(async (req, res) => {
  const { symbol } = symbolSchema.parse(req.params);
  const data = await integrationService.getCompanyProfile(symbol);
  return success(res, data);
});

const getCompanyNews = asyncHandler(async (req, res) => {
  const { company } = companySchema.parse(req.query);
  const data = await integrationService.getCompanyNews(company);
  return success(res, data);
});

const tavilySearch = asyncHandler(async (req, res) => {
  const { company } = companySchema.parse(req.query);
  const data = await integrationService.tavilySearch(company);
  return success(res, data);
});

const geminiGenerate = asyncHandler(async (req, res) => {
  const { prompt } = promptSchema.parse(req.body);
  const data = await integrationService.generateGroqReport({
    profile: { name: prompt, ticker: 'AAPL' },
    quote: {},
    financials: {},
    news: [],
    web: []
  });
  return success(res, data);
});

module.exports = {
  searchCompany,
  getCompanyProfile,
  getCompanyNews,
  tavilySearch,
  geminiGenerate,
};
