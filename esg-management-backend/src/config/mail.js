import nodemailer from 'nodemailer';
import { config } from './env.js';
import { logger } from './logger.js';

export const transport = nodemailer.createTransport(config.email.smtp);

/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server successfully'))
    .catch((err) => logger.warn(`Failed to establish connection to email server: ${err.message}`));
}

/**
 * Send an email helper
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 * @returns {Promise}
 */
export const sendEmail = async (to, subject, text, html) => {
  const msg = { from: config.email.smtp.auth.user, to, subject, text, html };
  await transport.sendMail(msg);
};
