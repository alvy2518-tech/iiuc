const { supabase, supabaseAdmin } = require('../config/supabase');
const { removeBackground } = require('@imgly/background-removal-node');
const sharp = require('sharp');

/**
 * Generate professional headshot by removing background and adding a white one.
 */
const generateHeadshot = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const userId = req.user.id;

    if (!imageBase64) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Image base64 data is required'
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

    // 1. Remove the background
    // Convert data URL to Buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const inputImageBuffer = Buffer.from(base64Data, 'base64');

    // Ensure the image is in a supported format (PNG) before background removal
    const pngImageBuffer = await sharp(inputImageBuffer).png().toBuffer();

    // Remove background
    const imageWithoutBg = await removeBackground(pngImageBuffer);

    // 2. Add a white background
    const outputImageBuffer = await imageWithoutBg.arrayBuffer();
    const finalImageBuffer = await sharp(Buffer.from(outputImageBuffer))
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .png()
      .toBuffer();

    const finalImageBase64 = `data:image/png;base64,${finalImageBuffer.toString('base64')}`;

    // Save to history/database
    const { data: headshot, error: headshotError } = await supabaseAdmin
      .from('professional_headshots')
      .insert({
        candidate_id: candidateProfile.id,
        original_image_url: imageBase64,
        generated_image_url: finalImageBase64,
        style: 'white_background', // A fixed style for this non-AI version
        prompt: 'Background removed and replaced with white.',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (headshotError) {
      console.error('Error saving headshot:', headshotError);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to save generated headshot'
      });
    }

    res.json({
      message: 'Headshot generated successfully',
      candidateId: candidateProfile.id,
      generatedImageUrl: finalImageBase64,
      originalImageUrl: imageBase64,
      style: 'white_background',
      id: headshot.id,
      created_at: headshot.created_at
    });

  } catch (error) {
    console.error('Generate headshot error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate professional headshot',
      details: error.message
    });
  }
};

/**
 * Get headshot history for candidate
 */
const getHeadshotHistory = async (req, res) => {
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

    // Get all generated headshots
    const { data: headshots, error: headshotsError } = await supabase
      .from('professional_headshots')
      .select('id, style, created_at, prompt, generated_image_url')
      .eq('candidate_id', candidateProfile.id)
      .order('created_at', { ascending: false });

    if (headshotsError) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch headshot history'
      });
    }

    res.json({
      message: 'Headshot history retrieved successfully',
      headshots: headshots || []
    });

  } catch (error) {
    console.error('Get headshot history error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve headshot history',
      details: error.message
    });
  }
};

/**
 * Delete headshot from history
 */
const deleteHeadshot = async (req, res) => {
  try {
    const { headshotId } = req.params;
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

    // Verify ownership
    const { data: headshot, error: headrshotCheckError } = await supabase
      .from('professional_headshots')
      .select('id')
      .eq('id', headshotId)
      .eq('candidate_id', candidateProfile.id)
      .single();

    if (headrshotCheckError || !headshot) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this headshot'
      });
    }

    // Delete headshot
    const { error: deleteError } = await supabaseAdmin
      .from('professional_headshots')
      .delete()
      .eq('id', headshotId);

    if (deleteError) {
      console.error('Error deleting headshot:', deleteError);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete headshot'
      });
    }

    res.json({
      message: 'Headshot deleted successfully'
    });

  } catch (error) {
    console.error('Delete headshot error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete headshot',
      details: error.message
    });
  }
};

module.exports = {
  generateHeadshot,
  getHeadshotHistory,
  deleteHeadshot
};
