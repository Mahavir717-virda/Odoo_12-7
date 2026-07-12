import { Router } from 'express';
import { ChallengeController } from './controllers/challenge.controller.js';
import { upload } from '../../middleware/upload.js';
import {
  createChallengeValidation,
  updateChallengeValidation,
  getChallengeByIdValidation,
  joinChallengeValidation,
  submitEvidenceValidation,
  verifyEvidenceValidation,
  createCategoryValidation,
  createBadgeValidation,
  createRewardValidation,
  redeemRewardValidation,
  queryChallengesValidation,
} from './challenge.validation.js';

const router = Router();
const controller = new ChallengeController();

// Leaderboard route
router.get('/leaderboard', controller.getLeaderboard);

// Category routes
router
  .route('/categories')
  .post(createCategoryValidation, controller.createCategory)
  .get(controller.getCategories);

// Challenge CRUD routes
router
  .route('/')
  .post(createChallengeValidation, controller.createChallenge)
  .get(queryChallengesValidation, controller.getChallenges);

// Joining & Progress routes
router.post('/join', joinChallengeValidation, controller.joinChallenge);
router.post('/progress', controller.updateProgress);

// Challenge Participants
router.get('/participants', controller.getParticipants);
router.patch('/participants/:id/complete', controller.approveParticipant);

// Evidence & Verification routes
router.post('/submit-evidence', upload.single('evidence'), submitEvidenceValidation, controller.submitEvidence);
router.get('/pending-evidence', controller.getPendingSubmissions);
router.post('/verify-evidence/:id', verifyEvidenceValidation, controller.verifyEvidence);

// Badge routes
router
  .route('/badges')
  .post(createBadgeValidation, controller.createBadge)
  .get(controller.getBadges);
router.get('/my-badges', controller.getEmployeeBadges);

// Reward routes
router
  .route('/rewards')
  .post(createRewardValidation, controller.createReward)
  .get(controller.getRewards);

router.post('/rewards/redeem', redeemRewardValidation, controller.redeemReward);

router
  .route('/:id')
  .get(getChallengeByIdValidation, controller.getChallengeById)
  .put(updateChallengeValidation, controller.updateChallenge)
  .delete(getChallengeByIdValidation, controller.deleteChallenge);

export default router;
