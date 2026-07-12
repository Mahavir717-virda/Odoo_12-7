import { Router } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { HTTP_STATUS } from '../../utils/constants.js';

const router = Router();

router.get('/date', (req, res) => {
  const options = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Date Range' }
  ];
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, options, 'Date filters retrieved'));
});

export default router;
