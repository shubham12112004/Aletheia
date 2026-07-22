const connectDatabase = require('../config/database');
const mongoose = require('mongoose');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const Research = require('../models/Research');
const UserSettings = require('../models/UserSettings');

async function testDatabasePhase() {
  console.log('=== PHASE 3: DATABASE & SCHEMAS TEST ===');

  try {
    await connectDatabase();
    console.log('✅ Connected to MongoDB.');

    // 1. User CRUD & Index
    const testEmail = `dbtest_${Date.now()}@example.com`;
    const user = await User.create({ email: testEmail, name: 'DB Tester' });
    console.log('✅ User model CRUD: Created user ID:', user._id);

    try {
      await User.create({ email: testEmail, name: 'Duplicate' });
      throw new Error('Duplicate email should have thrown index error');
    } catch (err) {
      if (err.code === 11000) {
        console.log('✅ User unique email index verified.');
      } else {
        throw err;
      }
    }

    // 2. Watchlist CRUD & Composite Index
    const item1 = await Watchlist.create({ userId: user._id, ticker: 'AAPL', name: 'Apple Inc.' });
    console.log('✅ Watchlist item created:', item1.ticker);

    try {
      await Watchlist.create({ userId: user._id, ticker: 'AAPL', name: 'Apple Inc.' });
      throw new Error('Duplicate watchlist ticker should have failed');
    } catch (err) {
      if (err.code === 11000) {
        console.log('✅ Watchlist composite unique index (userId + ticker) verified.');
      } else {
        throw err;
      }
    }

    const watchItems = await Watchlist.find({ userId: user._id });
    if (watchItems.length !== 1) throw new Error('Watchlist query count mismatch');
    console.log('✅ Watchlist query CRUD verified.');

    // 3. Research (History) CRUD
    const research = await Research.create({
      userId: user._id,
      company: 'Apple Inc.',
      ticker: 'AAPL',
      finalReport: { summary: 'Strong balance sheet' },
      executionTimeMs: 1200
    });
    console.log('✅ Research record created:', research._id);

    const historyItems = await Research.find({ userId: user._id });
    if (historyItems.length !== 1) throw new Error('Research query count mismatch');
    console.log('✅ Research query CRUD verified.');

    // 4. UserSettings CRUD
    const settings = await UserSettings.create({
      userId: user._id,
      theme: 'dark',
      profile: { bio: 'Investor' }
    });
    console.log('✅ UserSettings created:', settings._id);

    // Clean up
    await Watchlist.deleteMany({ userId: user._id });
    await Research.deleteMany({ userId: user._id });
    await UserSettings.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    console.log('✅ Database cleanup complete.');

    await mongoose.connection.close();
    console.log('=== PHASE 3 DATABASE VERIFICATION PASSED ===');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database phase test failed:', err);
    process.exit(1);
  }
}

testDatabasePhase();
