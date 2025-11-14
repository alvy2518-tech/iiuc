const axios = require('axios');

// SerpAPI configuration
// Use provided API key or environment variable. The key was provided by the user.
const SERPAPI_KEY = process.env.SERPAPI_KEY || 'dcc337c4fbf9488dc94059f96904d8c442282726b204117cd23998016d976f55';
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

/**
 * Search external jobs using SerpAPI Google Jobs
 */
exports.searchExternalJobs = async (req, res) => {
  try {
    const { query = 'software engineer', location = 'Bangladesh', ltype, chips, uds } = req.query;

    // Build SerpAPI request parameters according to documentation
    const params = {
      engine: 'google_jobs',
      q: query,
      api_key: SERPAPI_KEY,
      hl: 'en'
    };

    // Add location parameter if provided
    if (location) {
      params.location = location;
    }

    // Add optional parameters
    if (ltype) {
      params.ltype = ltype; // Work from home filter
    }

    if (chips) {
      params.chips = chips; // Additional query conditions
    }

    if (uds) {
      params.uds = uds; // Filter string provided by Google
    }

    console.log('Fetching external jobs from SerpAPI:', params);

    // Make request to SerpAPI
    const response = await axios.get(SERPAPI_BASE_URL, { 
      params,
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.jobs_results) {
      const jobs = response.data.jobs_results.map(job => ({
        id: job.job_id,
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        via: job.via,
        description: job.description,
        job_highlights: job.job_highlights,
        related_links: job.related_links,
        thumbnail: job.thumbnail,
        extensions: job.extensions,
        detected_extensions: job.detected_extensions,
        apply_options: job.apply_options,
        share_link: job.share_link
      }));

      return res.status(200).json({
        success: true,
        count: jobs.length,
        jobs: jobs,
        search_metadata: response.data.search_metadata,
        search_parameters: response.data.search_parameters,
        filters: response.data.filters
      });
    } else {
      return res.status(200).json({
        success: true,
        count: 0,
        jobs: [],
        message: 'No external jobs found'
      });
    }
  } catch (error) {
    console.error('Error fetching external jobs:', error.message);
    
    // Check if it's a SerpAPI error
    if (error.response && error.response.data) {
      return res.status(error.response.status || 500).json({
        success: false,
        message: 'Error fetching external jobs from SerpAPI',
        error: error.response.data.error || error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch external jobs',
      error: error.message
    });
  }
};

/**
 * Get job details from external source using job_id
 */
exports.getExternalJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;

    const params = {
      engine: 'google_jobs_listing',
      q: jobId,
      api_key: SERPAPI_KEY,
      hl: 'en'
    };

    console.log('Fetching external job details from SerpAPI:', params);

    const response = await axios.get(SERPAPI_BASE_URL, { 
      params,
      timeout: 10000 
    });

    if (response.data && response.data.apply_options) {
      return res.status(200).json({
        success: true,
        job: response.data
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'External job not found'
      });
    }
  } catch (error) {
    console.error('Error fetching external job details:', error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch external job details',
      error: error.message
    });
  }
};
