const express = require('express');
const router = express.Router();
const { analyzeJobSkills, analyzeCandidateJobMatch, getSkillRecommendations, triggerReanalysis, generateFreeCourses, analyzeApplicantCompatibility, generateCourseSummary, generateCourseMindMap, generateCourseNotes } = require('../controllers/aiAnalysis.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Job skills analysis (for recruiters)
router.post('/jobs/:jobId/analyze-skills', authenticate, analyzeJobSkills);

// Candidate-job skill match analysis
router.post('/jobs/:jobId/analyze-match', authenticate, analyzeCandidateJobMatch);

// Get skill recommendations
router.get('/jobs/:jobId/recommendations', authenticate, getSkillRecommendations);

// Trigger re-analysis
router.post('/reanalyze', authenticate, triggerReanalysis);

// Generate free courses
router.post('/courses/generate', authenticate, generateFreeCourses);

// Analyze applicant compatibility (for recruiters)
router.post('/applications/:applicationId/analyze', authenticate, analyzeApplicantCompatibility);

// Generate course summary
router.post('/courses/summary', authenticate, generateCourseSummary);

// Generate course mind map
router.post('/courses/mindmap', authenticate, generateCourseMindMap);

// Generate course study notes
router.post('/courses/notes', authenticate, generateCourseNotes);

module.exports = router;
