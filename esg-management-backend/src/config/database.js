import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

/**
 * Connect to MongoDB with retry logic
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    retryCount = 0; // reset counter on success

    // Seed default report types
    const { ReportType } = await import('../modules/report/report.model.js');
    const count = await ReportType.countDocuments();
    if (count === 0) {
      await ReportType.insertMany([
        {
          name: "Environmental Report",
          icon: "leaf",
          description: "Tracks Scope 1, Scope 2, Scope 3 greenhouse gas carbon emissions and sustainability goal progress.",
          allowedRoles: ['Admin', 'Sustainability Team', 'Manager'],
          category: 'Environmental',
          status: 'active',
          sortOrder: 1
        },
        {
          name: "Social Report",
          icon: "users",
          description: "Monitors employee participation, CSR activities, diversity statistics, and volunteer hours.",
          allowedRoles: ['Admin', 'HR', 'Manager'],
          category: 'Social',
          status: 'active',
          sortOrder: 2
        },
        {
          name: "Governance Report",
          icon: "shield-check",
          description: "Reviews policy acknowledgements, audits schedules, compliance issue resolutions, and risk levels.",
          allowedRoles: ['Admin', 'Compliance Team', 'Manager'],
          category: 'Governance',
          status: 'active',
          sortOrder: 3
        },
        {
          name: "ESG Summary",
          icon: "activity",
          description: "Comprehensive, weighted corporate ESG performance overview scoring all modules.",
          allowedRoles: ['Admin', 'Sustainability Team', 'Compliance Team', 'HR', 'Manager'],
          category: 'Summary',
          status: 'active',
          sortOrder: 4
        }
      ]);
      logger.info('Default report types seeded successfully');
    }
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.info(`Retrying connection to MongoDB in ${RETRY_INTERVAL_MS / 1000}s... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(connectDB, RETRY_INTERVAL_MS);
    } else {
      logger.error('Max MongoDB connection retries reached. Exiting process.');
      process.exit(1);
    }
  }
};
