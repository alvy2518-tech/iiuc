const Joi = require('joi');

// Recruiter profile schema
const recruiterProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  phoneNumber: Joi.string().allow('', null),
  companyName: Joi.string().min(2).max(200).required(),
  companyLogoUrl: Joi.string().uri().allow('', null),
  companyWebsite: Joi.string().uri().allow('', null),
  companySize: Joi.string().allow('', null),
  industry: Joi.string().allow('', null),
  companyDescription: Joi.string().max(1000).allow('', null),
  country: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().allow('', null)
});

// Candidate profile schema
const candidateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  phoneNumber: Joi.string().allow('', null),
  profilePictureUrl: Joi.string().uri().allow('', null),
  headline: Joi.string().max(200).allow('', null),
  dateOfBirth: Joi.date().allow(null),
  
  // Status fields
  profileType: Joi.string().valid('Student', 'Recent Graduate', 'Professional', 'Career Break').required(),
  currentEducationStatus: Joi.string().allow('', null),
  expectedGraduationDate: Joi.date().allow(null),
  
  // Professional fields
  yearsOfExperience: Joi.string().allow('', null),
  currentJobTitle: Joi.string().allow('', null),
  currentCompany: Joi.string().allow('', null),
  
  // Location
  country: Joi.string().required(),
  city: Joi.string().required(),
  willingToRelocate: Joi.boolean().default(false),
  preferredWorkModes: Joi.array().items(Joi.string().valid('Remote', 'On-site', 'Hybrid')).allow(null),
  
  // About
  bio: Joi.string().max(500).allow('', null),
  
  // Links
  portfolioWebsite: Joi.string().uri().allow('', null),
  linkedinUrl: Joi.string().uri().allow('', null),
  githubUrl: Joi.string().uri().allow('', null),
  behanceUrl: Joi.string().uri().allow('', null)
});

// Skill schema
const skillSchema = Joi.object({
  skillName: Joi.string().required(),
  skillLevel: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Expert').required()
});

// Experience schema
const experienceSchema = Joi.object({
  experienceType: Joi.string().valid('Full-time Job', 'Internship', 'Part-time Job', 'Freelance', 'Volunteer Work').required(),
  jobTitle: Joi.string().required(),
  company: Joi.string().required(),
  location: Joi.string().allow('', null),
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null),
  isCurrent: Joi.boolean().default(false),
  description: Joi.string().max(1000).allow('', null)
});

// Project schema
const projectSchema = Joi.object({
  projectTitle: Joi.string().required(),
  projectType: Joi.string().valid('Academic Project', 'Personal Project', 'Hackathon', 'Open Source', 'Freelance').required(),
  organization: Joi.string().allow('', null),
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null),
  isOngoing: Joi.boolean().default(false),
  description: Joi.string().required(),
  projectUrl: Joi.string().uri().allow('', null),
  technologiesUsed: Joi.array().items(Joi.string()).allow(null)
});

// Education schema
const educationSchema = Joi.object({
  educationType: Joi.string().valid('High School', 'Undergraduate', 'Masters', 'PhD', 'Diploma', 'Certification').required(),
  degree: Joi.string().required(),
  fieldOfStudy: Joi.string().required(),
  institution: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null),
  isCurrent: Joi.boolean().default(false),
  grade: Joi.string().allow('', null),
  achievements: Joi.string().max(500).allow('', null)
});

// Certification schema
const certificationSchema = Joi.object({
  certificationName: Joi.string().required(),
  issuingOrganization: Joi.string().required(),
  issueDate: Joi.date().required(),
  expiryDate: Joi.date().allow(null),
  doesNotExpire: Joi.boolean().default(false),
  credentialId: Joi.string().allow('', null),
  credentialUrl: Joi.string().uri().allow('', null)
});

// Job preferences schema
const jobPreferencesSchema = Joi.object({
  lookingFor: Joi.array().items(Joi.string()).allow(null),
  preferredRoles: Joi.array().items(Joi.string()).allow(null),
  preferredCountries: Joi.array().items(Joi.string()).allow(null),
  expectedSalaryMin: Joi.number().min(0).allow(null),
  expectedSalaryMax: Joi.number().min(0).allow(null),
  salaryCurrency: Joi.string().default('USD'),
  availableFrom: Joi.date().allow(null),
  noticePeriod: Joi.string().allow('', null)
});

module.exports = {
  recruiterProfileSchema,
  candidateProfileSchema,
  skillSchema,
  experienceSchema,
  projectSchema,
  educationSchema,
  certificationSchema,
  jobPreferencesSchema
};

