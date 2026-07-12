const { z } = require('zod');
const geminiService = require('../services/geminiService');
const tavilyService = require('../services/tavilyService');
const fmpService = require('../services/financialModelingPrepService');
const newsApiService = require('../services/newsApiService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const companySchema = z.object({ company: z.string().min(1) });
const symbolSchema = z.object({ symbol: z.string().min(1) });
const promptSchema = z.object({ prompt: z.string().min(1) });

const searchCompany = asyncHandler(async (req, res) => {
  const { company } = companySchema.parse(req.query);
  const data = await fmpService.searchCompany(company);
  return success(res, data);
});

const getCompanyProfile = asyncHandler(async (req, res) => {
  const { symbol } = symbolSchema.parse(req.params);
  const data = await fmpService.getCompanyProfile(symbol);
  return success(res, data);
});

const getCompanyNews = asyncHandler(async (req, res) => {
  const { company } = companySchema.parse(req.query);
  const data = await newsApiService.getCompanyNews(company);
  return success(res, data);
});

const tavilySearch = asyncHandler(async (req, res) => {
  const { company } = companySchema.parse(req.query);
  const data = await tavilyService.search(company);
  return success(res, data);
});

const geminiGenerate = asyncHandler(async (req, res) => {
  const { prompt } = promptSchema.parse(req.body);
  const data = await geminiService.generateContent(prompt);
  return success(res, data);
});

module.exports = {
  searchCompany,
  getCompanyProfile,
  getCompanyNews,
  tavilySearch,
  geminiGenerate,
};
