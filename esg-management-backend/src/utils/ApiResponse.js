/**
 * Standardized API Response class format.
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Payload data object/array
   * @param {string} message - Feedback message
   */
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.message = message;
    
    // Auto-detect list aggregation responses containing pagination parameters
    if (data && typeof data === 'object' && 'results' in data && 'totalRecords' in data) {
      this.data = data.results;
      
      const page = Number(data.page) || 1;
      const limit = Number(data.limit) || 10;
      const totalRecords = Number(data.totalRecords);
      const totalPages = Number(data.totalPages) || Math.ceil(totalRecords / limit);

      this.meta = {
        totalRecords,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };
    } else if (data && typeof data === 'object' && 'results' in data && 'totalCount' in data) {
      // Compatibility for legacy modules returning totalCount instead of totalRecords
      this.data = data.results;
      
      const page = Number(data.page) || 1;
      const limit = Number(data.limit) || 10;
      const totalRecords = Number(data.totalCount);
      const totalPages = Number(data.totalPages) || Math.ceil(totalRecords / limit);

      this.meta = {
        totalRecords,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };
    } else {
      this.data = data;
      this.meta = {};
    }
  }
}

