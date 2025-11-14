const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Analysis Service for Job Skills and Candidate Matching
 */
class AIAnalysisService {

  /**
   * Generate course summary using AI
   * @param {Object} courseData - Course information
   * @returns {Object} Summary with key points and takeaways
   */
  static async generateCourseSummary(courseData) {
    try {
      const prompt = `
        Analyze the following course and provide a comprehensive summary:
        
        Title: ${courseData.title}
        Description: ${courseData.description}
        Skills Covered: ${courseData.skills.join(', ')}
        Duration: ${courseData.duration}
        Level: ${courseData.level}
        Instructor: ${courseData.instructor}
        Platform: ${courseData.platform}
        
        Provide a JSON response with:
        1. overview: A 2-3 sentence overview of the course
        2. keyTopics: Array of 5-7 main topics covered
        3. learningOutcomes: Array of 5-7 specific things you'll learn
        4. targetAudience: Who should take this course
        5. prerequisites: Any prerequisites needed
        6. timeCommitment: Estimated time commitment
        
        Return ONLY valid JSON in this format:
        {
          "overview": "string",
          "keyTopics": ["topic1", "topic2", ...],
          "learningOutcomes": ["outcome1", "outcome2", ...],
          "targetAudience": "string",
          "prerequisites": "string",
          "timeCommitment": "string"
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
      });

      const content = response.choices[0].message.content.trim();
      const summary = JSON.parse(content);
      
      return summary;
    } catch (error) {
      console.error('Error generating course summary:', error);
      throw error;
    }
  }

  /**
   * Generate mind map structure for course using AI
   * @param {Object} courseData - Course information
   * @returns {Object} Mind map structure with nodes and connections
   */
  static async generateCourseMindMap(courseData) {
    try {
      const prompt = `
        Create a detailed mind map structure for the following course:
        
        Title: ${courseData.title}
        Description: ${courseData.description}
        Skills: ${courseData.skills.join(', ')}
        Level: ${courseData.level}
        
        Generate a hierarchical mind map with:
        - Central node: Course title
        - Main branches: 4-6 major topics/modules
        - Sub-branches: 3-5 subtopics for each main branch
        - Include relationships and dependencies
        
        Return ONLY valid JSON in this format:
        {
          "title": "Course Title",
          "nodes": [
            {
              "id": "1",
              "label": "Main Topic",
              "level": 1,
              "parentId": null,
              "color": "#633ff3"
            },
            {
              "id": "1.1",
              "label": "Subtopic",
              "level": 2,
              "parentId": "1",
              "color": "#8b5cf6"
            }
          ]
        }
        
        Use colors: #633ff3 for level 1, #8b5cf6 for level 2, #a78bfa for level 3
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
      });

      const content = response.choices[0].message.content.trim();
      const mindMap = JSON.parse(content);
      
      return mindMap;
    } catch (error) {
      console.error('Error generating mind map:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive study notes for course
   * @param {Object} courseData - Course information
   * @returns {Object} Detailed study notes with multiple sections
   */
  static async generateCourseNotes(courseData) {
    try {
      const prompt = `
        Generate comprehensive, in-depth technical study notes for the following course:
        
        Title: ${courseData.title}
        Description: ${courseData.description}
        Skills Covered: ${courseData.skills.join(', ')}
        Duration: ${courseData.duration}
        Level: ${courseData.level}
        Instructor: ${courseData.instructor}
        Platform: ${courseData.platform}
        
        Create detailed technical study notes (10-12 pages worth of content) with the following structure:
        
        1. Course Overview (1 page) - Comprehensive introduction
        2. Learning Objectives (1 page) - Clear goals and outcomes
        3. Main Topics with detailed technical explanations (6-8 pages):
           - For each major topic:
             * Technical introduction and industry relevance
             * Core technical concepts with definitions
             * Implementation details and architecture patterns
             * Code examples and syntax demonstrations
             * Real-world technical applications and use cases
             * Performance considerations and optimization techniques
             * Security best practices and common vulnerabilities
             * Industry standards and conventions
             * Debugging tips and troubleshooting strategies
             * Common technical pitfalls and how to avoid them
        4. Key Takeaways and Summary (1 page) - Critical technical insights
        5. Additional Resources and Next Steps (1 page) - Advanced learning paths
        6. Practice Exercises/Questions (1 page) - Technical challenges
        
        IMPORTANT: Make the content highly technical and comprehensive:
        - Include actual code snippets and syntax examples
        - Explain technical concepts in depth (algorithms, data structures, design patterns)
        - Cover implementation details (how things work under the hood)
        - Include technical terminology and industry-standard practices
        - Explain architecture patterns and system design considerations
        - Cover debugging techniques and error handling strategies
        - Include performance optimization tips
        - Discuss scalability and best practices
        - Reference technical documentation and standards
        - Provide hands-on technical examples
        
        Return ONLY valid JSON in this format:
        {
          "courseTitle": "string",
          "generatedDate": "string",
          "overview": {
            "introduction": "string (250-350 words - technical overview with industry context)",
            "courseScope": "string (200-250 words - technical scope and what will be covered)",
            "targetAudience": "string (120 words - technical prerequisites and audience)",
            "prerequisites": ["technical prerequisite 1", "technical prerequisite 2", ...]
          },
          "learningObjectives": {
            "primaryGoals": ["technical goal 1", "technical goal 2", ...],
            "skillsYouWillGain": ["technical skill 1", "technical skill 2", ...],
            "expectedOutcomes": "string (250 words - specific technical capabilities)"
          },
          "topics": [
            {
              "topicNumber": 1,
              "title": "string (technical topic name)",
              "introduction": "string (200-250 words - technical introduction)",
              "keyConcepts": [
                {
                  "concept": "string (technical concept name)",
                  "definition": "string (150-200 words - detailed technical definition)",
                  "importance": "string (80-120 words - technical importance and use cases)"
                }
              ],
              "detailedExplanation": "string (500-700 words - in-depth technical explanation with examples, code snippets, architecture patterns, implementation details)",
              "practicalExamples": ["technical example 1 (150 words with code)", "technical example 2 (150 words with code)"],
              "bestPractices": ["technical best practice 1 with reasoning", "technical best practice 2 with reasoning", ...],
              "commonMistakes": ["technical mistake 1 with solution", "technical mistake 2 with solution", ...]
            }
          ],
          "keyTakeaways": {
            "summary": "string (300-350 words - comprehensive technical summary)",
            "criticalPoints": ["critical technical point 1", "critical technical point 2", ...],
            "realWorldApplications": ["technical application 1 (80 words)", "technical application 2 (80 words)"]
          },
          "additionalResources": {
            "recommendedReading": ["technical resource/documentation 1", "technical resource 2", ...],
            "practiceProjects": ["technical project 1 with details", "technical project 2 with details", ...],
            "nextSteps": ["advanced technical step 1", "advanced technical step 2", ...]
          },
          "practiceExercises": [
            {
              "exerciseNumber": 1,
              "question": "string (technical challenge/problem)",
              "difficulty": "Easy|Medium|Hard",
              "hint": "string (technical hint with approach)"
            }
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const notes = JSON.parse(jsonContent);
      
      return notes;
    } catch (error) {
      console.error('Error generating course notes:', error);
      throw error;
    }
  }
  
  /**
   * Extract skills from job posting using AI
   * @param {Object} jobData - Complete job data
   * @returns {Array} Array of extracted skills
   */
  static async extractJobSkills(jobData) {
    try {
      const manualSkillsSection = jobData.requiredSkills && jobData.requiredSkills.length > 0
        ? `\nManually Specified Required Skills: ${jobData.requiredSkills.join(', ')}`
        : '';

      const prompt = `
        Analyze the following job posting and extract ALL technical skills, tools, technologies, and competencies mentioned.
        
        Job Title: ${jobData.jobTitle || ''}
        Department: ${jobData.department || ''}
        Job Description: ${jobData.jobDescription || ''}
        Responsibilities: ${jobData.responsibilities || ''}
        Qualifications: ${jobData.qualifications || ''}
        Nice to Have: ${jobData.niceToHave || ''}
        Benefits: ${jobData.benefits || ''}${manualSkillsSection}
        
        Return ONLY a JSON array of skills in this exact format:
        [
          {
            "skill": "skill_name",
            "category": "programming_language|framework|tool|soft_skill|other",
            "importance": "required|preferred|nice_to_have"
          }
        ]
        
        IMPORTANT: If there are manually specified required skills, you MUST include ALL of them in your output as "required" importance.
        Additionally, extract any other skills mentioned in the job description, responsibilities, and qualifications.
        Be comprehensive but precise. Include programming languages, frameworks, tools, methodologies, soft skills, etc.
        Normalize skill names (e.g., "React.js" -> "React", "JavaScript" -> "JavaScript").
        Do not include generic terms like "experience" or "knowledge".
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing job postings and extracting technical skills. Return only valid JSON arrays."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const extractedSkills = JSON.parse(response.choices[0].message.content);
      
      // Validate and normalize the response
      if (!Array.isArray(extractedSkills)) {
        throw new Error('AI returned invalid format');
      }

      return extractedSkills.map(skill => ({
        skill: skill.skill?.toLowerCase().trim() || '',
        category: skill.category || 'other',
        importance: skill.importance || 'required'
      })).filter(skill => skill.skill.length > 0);

    } catch (error) {
      console.error('Error extracting job skills:', error);
      throw new Error('Failed to extract job skills using AI');
    }
  }

  /**
   * Analyze candidate skills against job requirements
   * @param {Array} candidateSkills - Candidate's skills array
   * @param {Array} jobSkills - Job's required skills array
   * @returns {Object} Analysis result with matching and missing skills
   */
  static async analyzeSkillMatch(candidateSkills, jobSkills) {
    try {
      const prompt = `
        Analyze the skill match between a candidate and a job posting.
        
        CANDIDATE SKILLS:
        ${JSON.stringify(candidateSkills, null, 2)}
        
        JOB REQUIRED SKILLS:
        ${JSON.stringify(jobSkills, null, 2)}
        
        Return a JSON object in this exact format:
        {
          "matching_skills": [
            {
              "skill": "skill_name",
              "candidate_level": "Beginner|Intermediate|Advanced|Expert",
              "job_requirement": "required|preferred|nice_to_have",
              "match_quality": "exact|similar|partial"
            }
          ],
          "missing_skills": [
            {
              "skill": "skill_name",
              "job_requirement": "required|preferred|nice_to_have",
              "importance": "high|medium|low"
            }
          ],
          "match_percentage": 85
        }
        
        Rules:
        - Consider skill variations (e.g., "React" matches "React.js", "JavaScript" matches "JS")
        - Be generous with matching - include similar skills
        - Calculate match percentage based on required skills only
        - Include soft skills in analysis
        - Prioritize exact matches over similar ones
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert recruiter analyzing skill compatibility. Return only valid JSON objects."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3000
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Validate response structure
      if (!analysis.matching_skills || !analysis.missing_skills || typeof analysis.match_percentage !== 'number') {
        throw new Error('AI returned invalid analysis format');
      }

      return {
        matching_skills: analysis.matching_skills || [],
        missing_skills: analysis.missing_skills || [],
        match_percentage: Math.max(0, Math.min(100, analysis.match_percentage || 0))
      };

    } catch (error) {
      console.error('Error analyzing skill match:', error);
      throw new Error('Failed to analyze skill match using AI');
    }
  }

  /**
   * Get skill recommendations for missing skills
   * @param {Array} missingSkills - Array of missing skills
   * @returns {Array} Array of skill recommendations with learning paths
   */
  static async getSkillRecommendations(missingSkills) {
    try {
      if (!missingSkills || missingSkills.length === 0) {
        return [];
      }

      const prompt = `
        Provide learning recommendations for these missing skills:
        ${JSON.stringify(missingSkills, null, 2)}
        
        Return a JSON array in this format:
        [
          {
            "skill": "skill_name",
            "learning_path": "Brief description of how to learn this skill",
            "resources": ["resource1", "resource2"],
            "estimated_time": "time_estimate",
            "difficulty": "beginner|intermediate|advanced"
          }
        ]
        
        Focus on practical, actionable learning paths.
        Include free and paid resources.
        Be specific about time estimates.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a career development expert providing skill learning recommendations. Return only valid JSON arrays."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const recommendations = JSON.parse(response.choices[0].message.content);
      
      return Array.isArray(recommendations) ? recommendations : [];

    } catch (error) {
      console.error('Error getting skill recommendations:', error);
      return [];
    }
  }

  /**
   * Generate comprehensive learning roadmap for multiple interested jobs
   * @param {Array} candidateSkills - Candidate's current skills
   * @param {Array} interestedJobs - Array of interested jobs with their skills
   * @returns {Object} Structured learning roadmap with phases
   */
  static async generateLearningRoadmap(candidateSkills, interestedJobs) {
    try {
      if (!interestedJobs || interestedJobs.length === 0) {
        return {
          learning_phases: [],
          career_paths: [],
          total_time_estimate: '0 months',
          total_skills_needed: 0
        };
      }

      // Aggregate all unique skills from all interested jobs
      const allJobSkills = [];
      interestedJobs.forEach(job => {
        if (job.skills && Array.isArray(job.skills)) {
          job.skills.forEach(skill => {
            allJobSkills.push({
              skill: skill.skill_name,
              job_title: job.job_title,
              job_id: job.id
            });
          });
        }
      });

      // Format candidate skills for clarity
      const candidateSkillsList = candidateSkills.map(s => `${s.skill_name} (${s.skill_level})`).join(', ') || 'None';
      
      // Format job requirements for clarity
      const jobsSummary = interestedJobs.map(job => {
        const requiredSkills = job.skills?.map(s => s.skill_name).join(', ') || 'Not specified';
        return `- ${job.job_title} (${job.department}, ${job.experience_level}): Requires ${requiredSkills}`;
      }).join('\n');

      // Get all unique required skills
      const allRequiredSkills = new Set();
      interestedJobs.forEach(job => {
        if (job.skills && Array.isArray(job.skills)) {
          job.skills.forEach(skill => allRequiredSkills.add(skill.skill_name));
        }
      });
      const requiredSkillsList = Array.from(allRequiredSkills).join(', ') || 'None';

      const prompt = `
        You are a career development expert. Analyze a candidate's skills against their interested jobs and create a personalized learning roadmap.
        
        CANDIDATE'S CURRENT SKILLS (with expertise levels):
        ${candidateSkillsList}
        
        CANDIDATE'S INTERESTED JOBS:
        ${jobsSummary}
        
        ALL REQUIRED SKILLS FROM INTERESTED JOBS:
        ${requiredSkillsList}
        
        CRITICAL ANALYSIS TASK:
        1. For EACH required skill, check if the candidate ALREADY HAS it
        2. If they have it:
           - Check their current level (Beginner, Intermediate, Advanced, Expert)
           - Determine if they need to UPGRADE (e.g., "React from Beginner to Intermediate")
           - If their level is already sufficient, SKIP this skill entirely
        3. If they DON'T have it:
           - Mark it as a NEW SKILL to learn
        4. Create a roadmap with ONLY:
           - NEW skills the candidate doesn't have at all
           - UPGRADE paths for skills they have but need to improve
        
        IMPORTANT MATCHING RULES:
        - Match skills case-insensitively (e.g., "React", "react", "REACT" are the same)
        - Match skill variants (e.g., "Node.js", "Nodejs", "NodeJS" are the same)
        - If candidate has "React (Beginner)" and job needs "React", they need to UPGRADE to Intermediate/Advanced
        - If candidate has "AWS (Expert)" and job needs "AWS", SKIP it (they already have it)
        
        Create a LINEAR learning path (Phase 1 → Phase 2 → Phase 3...) that:
        1. Starts with foundational NEW skills or critical UPGRADES
        2. Progresses to intermediate skills and upgrades
        3. Ends with advanced/specialized skills
        4. Shows which skills unlock which career opportunities
        5. Provides realistic time estimates for each phase
        6. For EACH skill, clearly indicates if it's NEW or an UPGRADE
        
        Return ONLY a JSON object in this EXACT format:
        {
          "skill_gap_analysis": {
            "new_skills_needed": ["JavaScript", "AWS", "Docker"],
            "skills_to_upgrade": [
              {"skill": "React", "current_level": "Beginner", "target_level": "Intermediate"},
              {"skill": "Node.js", "current_level": "Beginner", "target_level": "Advanced"}
            ],
            "skills_already_sufficient": ["Python", "C"]
          },
          "learning_phases": [
            {
              "phase": 1,
              "title": "Foundation Skills",
              "description": "Core skills you need to start your journey",
              "duration": "2-3 months",
              "skills": [
                {
                  "skill": "JavaScript",
                  "skill_type": "new",
                  "current_level": null,
                  "target_level": "Intermediate",
                  "category": "programming_language",
                  "difficulty": "beginner",
                  "time_estimate": "4 weeks",
                  "learning_path": "Start with basics, then ES6+",
                  "resources": ["freeCodeCamp", "MDN Web Docs", "JavaScript.info"],
                  "unlocks": ["React", "Node.js"],
                  "required_for_jobs": ["uuid1", "uuid2"],
                  "gap_addressed": "Missing foundational skill for frontend development"
                }
              ]
            },
            {
              "phase": 2,
              "title": "Skill Upgrades",
              "description": "Improve your existing skills to job-ready level",
              "duration": "3-4 months",
              "prerequisites": ["JavaScript"],
              "skills": [
                {
                  "skill": "React",
                  "skill_type": "upgrade",
                  "current_level": "Beginner",
                  "target_level": "Intermediate",
                  "category": "framework",
                  "difficulty": "intermediate",
                  "time_estimate": "6 weeks",
                  "learning_path": "Focus on advanced hooks, context, and state management",
                  "resources": ["React Official Docs", "Epic React"],
                  "unlocks": ["Next.js", "React Native"],
                  "required_for_jobs": ["uuid1"],
                  "gap_addressed": "Upgrade from Beginner to meet job requirements"
                }
              ]
            }
          ],
          "career_paths": [
            {
              "role": "Frontend Developer",
              "target_job_ids": ["uuid1", "uuid2"],
              "required_phases": [1, 2],
              "readiness_percentage": "75%",
              "job_titles": ["Frontend Developer", "React Developer"]
            }
          ],
          "total_time_estimate": "6-9 months",
          "total_skills_needed": 15,
          "summary": "Your learning journey focuses on 5 new skills and upgrading 3 existing skills to meet job requirements"
        }
        
        IMPORTANT RULES:
        - FIRST: Create the "skill_gap_analysis" section comparing candidate skills vs job requirements
        - For EVERY skill in learning_phases, set "skill_type" to either "new" or "upgrade"
        - For "new" skills: current_level = null, target_level = recommended level
        - For "upgrade" skills: current_level = candidate's current level, target_level = required level
        - For "difficulty" field: set to "beginner"/"intermediate"/"advanced" based on how hard it is TO LEARN (not candidate's current level)
        - In "gap_addressed", explain what gap this fills (e.g., "New skill needed for job X" or "Upgrade from Beginner to Intermediate")
        - For career_paths: ALWAYS fill "readiness_percentage" (e.g., "65%", "80%", "95%") - estimate how job-ready they'll be
        - Make phases LINEAR and sequential (must complete phase 1 before phase 2)
        - Group related skills together in same phase
        - Ensure prerequisites are in earlier phases
        - Be realistic with time estimates
        - Link skills to specific job IDs where they're required
        - Limit to 3-5 phases maximum
        - Each phase should have 3-8 skills
        - If candidate already has a skill at Expert level, DO NOT include it
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert career advisor creating structured learning roadmaps. Return only valid JSON objects with the exact structure specified. Do NOT wrap the JSON in markdown code blocks."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      });

      // Parse the response, handling potential markdown wrapping
      let roadmap;
      try {
        const content = response.choices?.[0]?.message?.content?.trim();
        if (!content) {
          throw new Error('AI returned empty response');
        }
        
        console.log('AI Roadmap Response - Content length:', content.length);
        console.log('AI Roadmap Response - Preview:', content.substring(0, 100));
        
        // Try to extract JSON from markdown code blocks
        let jsonContent = content;
        if (content.startsWith('```')) {
          // Remove markdown code blocks
          jsonContent = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
        }
        
        roadmap = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Roadmap parse error:', parseError);
        console.error('Response content:', response.choices?.[0]?.message?.content);
        throw new Error('Failed to parse roadmap from AI response');
      }
      
      // Validate response structure
      if (!roadmap.learning_phases || !Array.isArray(roadmap.learning_phases)) {
        throw new Error('AI returned invalid roadmap format');
      }

      return {
        skill_gap_analysis: roadmap.skill_gap_analysis || {
          new_skills_needed: [],
          skills_to_upgrade: [],
          skills_already_sufficient: []
        },
        learning_phases: roadmap.learning_phases || [],
        career_paths: roadmap.career_paths || [],
        total_time_estimate: roadmap.total_time_estimate || '0 months',
        total_skills_needed: roadmap.total_skills_needed || 0,
        summary: roadmap.summary || ''
      };

    } catch (error) {
      console.error('Error generating learning roadmap:', error);
      throw new Error('Failed to generate learning roadmap using AI');
    }
  }

  /**
   * Analyze candidate compatibility with job requirements
   * @param {Object} candidateData - Candidate profile, skills, experience, education
   * @param {Object} jobData - Job requirements, skills, qualifications
   * @returns {Object} Compatibility analysis with score and gaps
   */
  static async analyzeCandidateCompatibility(candidateData, jobData) {
    try {
      const prompt = `
        You are an expert recruiter analyzing candidate fit for a job position.
        Analyze the candidate's qualifications against the job requirements comprehensively.
        
        JOB REQUIREMENTS:
        Job Title: ${jobData.job_title || ''}
        Experience Level: ${jobData.experience_level || ''}
        Job Type: ${jobData.job_type || ''}
        Job Description: ${jobData.job_description || ''}
        Responsibilities: ${jobData.responsibilities || ''}
        Required Qualifications: ${jobData.qualifications || ''}
        Nice to Have: ${jobData.nice_to_have || ''}
        Minimum Experience: ${jobData.minimum_experience_years || 0} years
        Required Skills: ${JSON.stringify(jobData.required_skills || [])}
        
        CANDIDATE PROFILE:
        Current Role: ${candidateData.current_job_title || 'Not specified'}
        Current Company: ${candidateData.current_company || 'Not specified'}
        Years of Experience: ${candidateData.years_of_experience || 0}
        Bio: ${candidateData.bio || 'Not provided'}
        
        Candidate Skills:
        ${JSON.stringify(candidateData.skills || [], null, 2)}
        
        Work Experience:
        ${JSON.stringify(candidateData.experience || [], null, 2)}
        
        Education:
        ${JSON.stringify(candidateData.education || [], null, 2)}
        
        Certifications:
        ${JSON.stringify(candidateData.certifications || [], null, 2)}
        
        Return ONLY a JSON object in this EXACT format:
        {
          "overall_score": 85,
          "score_breakdown": {
            "skills_match": 80,
            "experience_match": 90,
            "education_match": 85,
            "overall_fit": 85
          },
          "strengths": [
            "Strong technical skills in required technologies",
            "Relevant work experience in similar role",
            "Excellent educational background"
          ],
          "skill_gaps": [
            "Missing: React.js - Required for frontend development",
            "Limited experience with: AWS - Needed for cloud deployment",
            "No certification in: Project Management"
          ],
          "experience_gaps": [
            "Lacks experience in leading teams",
            "Limited exposure to enterprise-scale projects"
          ],
          "recommendations": [
            "Strong candidate - Schedule interview immediately",
            "Consider for senior role given experience level",
            "May need training in React.js framework"
          ],
          "fit_level": "Excellent Fit",
          "summary": "This candidate demonstrates strong alignment with the job requirements with 85% compatibility. They possess most required skills and relevant experience. Minor gaps in React.js can be addressed through training."
        }
        
        SCORING GUIDELINES:
        - 90-100: Excellent fit - Exceeds requirements
        - 75-89: Good fit - Meets most requirements
        - 60-74: Moderate fit - Meets some requirements
        - Below 60: Poor fit - Significant gaps
        
        IMPORTANT RULES:
        - Be objective and data-driven in analysis
        - Highlight specific skill and experience gaps
        - Consider years of experience vs job requirements
        - Evaluate education relevance
        - Provide actionable recommendations
        - Use bullet points for clarity
        - Be honest about gaps but also highlight strengths
        - Score should reflect realistic compatibility
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [
          {
            role: "system",
            content: "You are an expert recruiter and HR analyst providing objective candidate assessments. Return only valid JSON objects."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Validate response structure
      if (!analysis.overall_score || !analysis.score_breakdown) {
        throw new Error('AI returned invalid analysis format');
      }

      return {
        overall_score: Math.max(0, Math.min(100, analysis.overall_score || 0)),
        score_breakdown: analysis.score_breakdown || {},
        strengths: analysis.strengths || [],
        skill_gaps: analysis.skill_gaps || [],
        experience_gaps: analysis.experience_gaps || [],
        recommendations: analysis.recommendations || [],
        fit_level: analysis.fit_level || 'Unknown',
        summary: analysis.summary || ''
      };

    } catch (error) {
      console.error('Error analyzing candidate compatibility:', error);
      throw new Error('Failed to analyze candidate compatibility using AI');
    }
  }

  /**
   * Generate skill verification exam questions
   * @param {string} skillName - Name of the skill
   * @param {string} skillLevel - Level (Beginner, Intermediate, Advanced, Expert)
   * @returns {Array} Array of 10 exam questions with answers
   */
  static async generateSkillVerificationExam(skillName, skillLevel) {
    try {
      const difficultyMap = {
        'Beginner': 'basic and fundamental concepts',
        'Intermediate': 'intermediate concepts with practical applications',
        'Advanced': 'advanced concepts, best practices, and complex scenarios',
        'Expert': 'expert-level concepts, architecture, optimization, and edge cases'
      };

      const difficulty = difficultyMap[skillLevel] || difficultyMap['Beginner'];

      const prompt = `
        You must respond with STRICT JSON ONLY. No commentary, no markdown.

        Generate a skill verification exam for "${skillName}" at "${skillLevel}" level.
        Requirements:
        - Exactly 10 questions
        - Questions should test ${difficulty}
        - Each question must be multiple choice with 4 options (A, B, C, D)
        - Only one correct answer per question
        - Difficulty must match ${skillLevel} level

        The response MUST be a JSON array that matches this schema exactly:
        [
          {
            "question": "string",
            "options": {
              "A": "string",
              "B": "string",
              "C": "string",
              "D": "string"
            },
            "correctAnswer": "A"
          }
        ]

        Return ONLY the JSON array.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",  // Fast, non-reasoning model
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer. Return ONLY a valid JSON array, nothing else."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_completion_tokens: 3000,
        temperature: 0.7  // Add some variability to questions
      });

      // Log the full response for debugging
      console.log('AI Response - Finish reason:', response.choices?.[0]?.finish_reason);
      console.log('AI Response - Reasoning tokens:', response.usage?.completion_tokens_details?.reasoning_tokens);
      console.log('AI Response - Content length:', response.choices?.[0]?.message?.content?.length || 0);
      console.log('AI Response - Content preview:', response.choices?.[0]?.message?.content?.substring(0, 200));

      // Parse the response
      let questions;
      try {
        const content = response.choices?.[0]?.message?.content?.trim();
        if (!content) {
          console.error('AI returned empty content. Model used all tokens for reasoning.');
          console.error('Usage:', response.usage);
          throw new Error('AI returned empty response. Try using gpt-4o-mini instead of gpt-5-mini.');
        }
        // Try to extract JSON array from response
        let jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          // If no array found, try parsing as object
          const parsed = JSON.parse(content);
          questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.exam || []);
        } else {
          questions = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        console.error('Response content:', response.choices[0].message.content);
        throw new Error('Failed to parse exam questions from AI response');
      }

      // Validate we have exactly 10 questions
      if (!Array.isArray(questions) || questions.length !== 10) {
        throw new Error(`Expected 10 questions, got ${questions?.length || 0}`);
      }

      // Validate each question has required fields
      const optionLabels = ['A', 'B', 'C', 'D'];
      const randomizeOptions = (question, index) => {
        if (!question.question || !question.options || !question.correctAnswer) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        if (!optionLabels.includes(question.correctAnswer)) {
          throw new Error(`Question ${index + 1} has invalid correctAnswer`);
        }
        if (!question.options.A || !question.options.B || !question.options.C || !question.options.D) {
          throw new Error(`Question ${index + 1} is missing options`);
        }

        // Shuffle options to avoid always having the correct answer as A
        const shuffledEntries = Object.entries(question.options)
          .sort(() => Math.random() - 0.5);

        const newOptions = {};
        let newCorrectAnswer = 'A';

        shuffledEntries.forEach(([label, value], idx) => {
          const newLabel = optionLabels[idx];
          newOptions[newLabel] = value;
          if (label === question.correctAnswer) {
            newCorrectAnswer = newLabel;
          }
        });

        return {
          ...question,
          options: newOptions,
          correctAnswer: newCorrectAnswer,
          explanation: question.explanation || ''
        };
      };

      const randomizedQuestions = questions.map((question, index) => randomizeOptions(question, index));

      return randomizedQuestions;
    } catch (error) {
      console.error('Error generating skill verification exam:', error);
      throw new Error(`Failed to generate exam: ${error.message}`);
    }
  }

  /**
   * Evaluate exam answers and calculate score
   * @param {Array} questions - Original exam questions
   * @param {Array} answers - User's answers
   * @returns {Object} Score and results
   */
  static evaluateExamAnswers(questions, answers) {
    let score = 0;
    const results = [];

    questions.forEach((question, index) => {
      const userAnswer = answers[index]?.answer || '';
      const isCorrect = userAnswer.toUpperCase() === question.correctAnswer.toUpperCase();
      
      if (isCorrect) {
        score++;
      }

      results.push({
        questionIndex: index,
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation || ''
      });
    });

    return {
      score,
      totalMarks: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      passed: score >= 7, // Passing score is 7/10
      results
    };
  }
}

module.exports = AIAnalysisService;
