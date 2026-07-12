/**
 * Reward Module Constants
 */

export const REWARD_TYPE = {
  VOUCHER: 'Voucher',
  GIFT_CARD: 'GiftCard',
  LEAVE: 'Leave',
  MERCHANDISE: 'Merchandise',
};

export const ALLOWED_REWARD_TYPES = Object.values(REWARD_TYPE);

export const REDEMPTION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  DELIVERED: 'Delivered',
  REJECTED: 'Rejected',
};

export const ALLOWED_REDEMPTION_STATUSES = Object.values(REDEMPTION_STATUS);
