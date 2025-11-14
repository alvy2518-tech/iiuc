const { supabase, supabaseAdmin } = require('../config/supabase');
const youtubeService = require('../services/youtube.service');

/**
 * Get all courses for the authenticated candidate grouped by roadmap
 */
const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get candidate profile
    const { data: candidateProfile, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (candidateError || !candidateProfile) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Candidate profile not found'
      });
    }

    // Get active courses
    const { data: courses, error: coursesError } = await supabase
      .from('candidate_courses')
      .select('*')
      .eq('candidate_id', candidateProfile.id)
      .eq('is_archived', false)
      .order('phase_number', { ascending: true })
      .order('created_at', { ascending: true });

    if (coursesError) {
      throw coursesError;
    }

    // Get current roadmap to group courses by phases
    const { data: roadmap } = await supabase
      .from('candidate_learning_roadmaps')
      .select('roadmap_data')
      .eq('candidate_id', candidateProfile.id)
      .single();

    res.json({
      message: 'Courses retrieved successfully',
      courses: courses || [],
      roadmap: roadmap?.roadmap_data || null
    });

  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve courses'
    });
  }
};

/**
 * Add a course for a specific skill by searching YouTube
 */
const addCourseForSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skillName, skillLevel, phaseNumber } = req.body;

    if (!skillName || !skillLevel) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'skillName and skillLevel are required'
      });
    }

    // Get candidate profile
    const { data: candidateProfile, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (candidateError || !candidateProfile) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Candidate profile not found'
      });
    }

    // Check if course already exists
    const { data: existingCourse } = await supabase
      .from('candidate_courses')
      .select('*')
      .eq('candidate_id', candidateProfile.id)
      .eq('skill_name', skillName)
      .eq('skill_level', skillLevel)
      .single();

    if (existingCourse) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Course already exists for this skill'
      });
    }

    // Search YouTube for a video
    const video = await youtubeService.searchCourseForSkill(skillName, skillLevel);

    // Insert course
    const { data: course, error: insertError } = await supabase
      .from('candidate_courses')
      .insert({
        candidate_id: candidateProfile.id,
        skill_name: skillName,
        skill_level: skillLevel,
        phase_number: phaseNumber,
        youtube_video_id: video.videoId,
        video_title: video.title,
        video_description: video.description,
        thumbnail_url: video.thumbnailUrl,
        channel_name: video.channelName,
        duration: video.duration,
        published_at: video.publishedAt
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    res.json({
      message: 'Course added successfully',
      course
    });

  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to add course'
    });
  }
};

/**
 * Mark a course as watched/unwatched
 */
const updateWatchStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;
    const { isWatched } = req.body;

    if (typeof isWatched !== 'boolean') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'isWatched must be a boolean'
      });
    }

    // Get candidate profile
    const { data: candidateProfile, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (candidateError || !candidateProfile) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Candidate profile not found'
      });
    }

    // Update watch status
    const { data: course, error: updateError } = await supabase
      .from('candidate_courses')
      .update({
        is_watched: isWatched,
        watched_at: isWatched ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId)
      .eq('candidate_id', candidateProfile.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!course) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Course not found'
      });
    }

    res.json({
      message: 'Watch status updated',
      course
    });

  } catch (error) {
    console.error('Update watch status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update watch status'
    });
  }
};

/**
 * Delete a course
 */
const deleteCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    // Get candidate profile
    const { data: candidateProfile, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (candidateError || !candidateProfile) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Candidate profile not found'
      });
    }

    // Delete course
    const { error: deleteError } = await supabase
      .from('candidate_courses')
      .delete()
      .eq('id', courseId)
      .eq('candidate_id', candidateProfile.id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete course'
    });
  }
};

/**
 * Get archived courses
 */
const getArchivedCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get candidate profile
    const { data: candidateProfile, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (candidateError || !candidateProfile) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Candidate profile not found'
      });
    }

    // Get archived courses
    const { data: courses, error: coursesError } = await supabase
      .from('candidate_courses')
      .select('*')
      .eq('candidate_id', candidateProfile.id)
      .eq('is_archived', true)
      .order('updated_at', { ascending: false });

    if (coursesError) {
      throw coursesError;
    }

    res.json({
      message: 'Archived courses retrieved successfully',
      courses: courses || []
    });

  } catch (error) {
    console.error('Get archived courses error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve archived courses'
    });
  }
};

module.exports = {
  getMyCourses,
  addCourseForSkill,
  updateWatchStatus,
  deleteCourse,
  getArchivedCourses
};

