const mongoose = require('mongoose');

const ResearchSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    company: { type: String, required: true, index: true },
    ticker: { type: String, index: true },
    graphState: { type: mongoose.Schema.Types.Mixed },
    intermediateOutputs: { type: mongoose.Schema.Types.Mixed },
    finalReport: { type: mongoose.Schema.Types.Mixed },
    sources: { type: [mongoose.Schema.Types.Mixed], default: [] },
    executionTimeMs: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Research', ResearchSchema);
