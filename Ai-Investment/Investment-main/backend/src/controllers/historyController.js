const Research = require('../models/Research');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

// Get all research history for user
const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Exclude large graphState and intermediateOutputs from the list view to save bandwidth
  const history = await Research.find({ userId })
    .select('-graphState -intermediateOutputs')
    .sort({ createdAt: -1 });

  return success(res, history);
});

// Get single research by ID
const getResearchById = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const research = await Research.findOne({ _id: id, userId });
  if (!research) {
    throw new AppError('Research not found or unauthorized', 404);
  }

  return success(res, research);
});

// Delete research
const deleteResearch = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const research = await Research.findOneAndDelete({ _id: id, userId });
  if (!research) {
    throw new AppError('Research not found or unauthorized', 404);
  }

  return success(res, null, 'Research deleted successfully');
});

module.exports = {
  getHistory,
  getResearchById,
  deleteResearch
};
