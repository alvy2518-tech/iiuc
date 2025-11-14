const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  /**
   * Search YouTube for a video related to a skill
   * @param {string} skillName - Name of the skill
   * @param {string} skillLevel - Skill level (Beginner, Intermediate, Advanced, Expert)
   * @returns {Object} Best matching video
   */
  async searchCourseForSkill(skillName, skillLevel) {
    try {
      // Build search query
      const query = `${skillName} ${skillLevel} tutorial course`;
      
      console.log(`Searching YouTube for: ${query}`);

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          key: this.apiKey,
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults: 5,
          order: 'relevance',
          videoDuration: 'medium', // 4-20 minutes
          videoDefinition: 'high'
        }
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('No videos found');
      }

      // Get video details (duration, view count)
      const videoIds = response.data.items.map(item => item.id.videoId).join(',');
      const detailsResponse = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          key: this.apiKey,
          id: videoIds,
          part: 'snippet,contentDetails,statistics'
        }
      });

      // Sort by view count and pick the best one
      const videos = detailsResponse.data.items.map(video => ({
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
        channelName: video.snippet.channelTitle,
        duration: this.parseDuration(video.contentDetails.duration),
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics.viewCount || 0)
      }));

      // Filter by minimum views (>5000) and sort by views
      const filteredVideos = videos
        .filter(v => v.viewCount > 5000)
        .sort((a, b) => b.viewCount - a.viewCount);

      if (filteredVideos.length === 0) {
        // If no videos meet criteria, return the most viewed from original results
        return videos.sort((a, b) => b.viewCount - a.viewCount)[0];
      }

      return filteredVideos[0];
    } catch (error) {
      console.error('YouTube search error:', error.response?.data || error.message);
      throw new Error(`Failed to search YouTube: ${error.message}`);
    }
  }

  /**
   * Parse ISO 8601 duration to readable format
   * @param {string} duration - ISO 8601 duration (e.g., PT1H2M10S)
   * @returns {string} Human-readable duration (e.g., "1:02:10")
   */
  parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'Unknown';

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

module.exports = new YouTubeService();

