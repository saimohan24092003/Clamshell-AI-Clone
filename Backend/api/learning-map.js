// Helper function to set CORS headers
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',')
    : ['https://coursecraft-frontend-mohammed-asrafs-projects.vercel.app'];

  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

// Generate professional learning map based on content, SME answers, and chosen strategy
function generateLearningMap(content, domain, smeAnswers, selectedStrategy) {
  const learningMap = {
    title: `${domain} Learning Journey`,
    overview: `Structured learning pathway designed based on content analysis and instructional strategy`,
    phases: []
  };

  // Phase 1: Foundation
  learningMap.phases.push({
    phase: 1,
    name: 'Foundation & Orientation',
    duration: '15-20 minutes',
    objectives: [
      'Understand the context and importance of the subject matter',
      'Identify personal learning goals and success criteria',
      'Review prerequisite knowledge and skills'
    ],
    activities: [
      {
        type: 'Introduction',
        description: 'Welcome video and course overview',
        deliverable: 'Learning goals worksheet completed'
      },
      {
        type: 'Pre-Assessment',
        description: 'Knowledge check to gauge baseline understanding',
        deliverable: 'Pre-assessment results reviewed'
      }
    ],
    assessments: ['Self-reflection questionnaire', 'Baseline knowledge quiz']
  });

  // Phase 2: Knowledge Building (content-specific)
  const knowledgeActivities = [];
  if (domain.includes('Healthcare')) {
    knowledgeActivities.push({
      type: 'Clinical Case Review',
      description: 'Analyze patient scenarios and clinical protocols',
      deliverable: 'Case analysis documentation'
    });
  } else if (domain.includes('Technology')) {
    knowledgeActivities.push({
      type: 'Concept Application',
      description: 'Code-along tutorials and technical demonstrations',
      deliverable: 'Working code samples'
    });
  } else {
    knowledgeActivities.push({
      type: 'Concept Exploration',
      description: 'Interactive modules and multimedia content',
      deliverable: 'Concept summary notes'
    });
  }

  learningMap.phases.push({
    phase: 2,
    name: 'Knowledge Acquisition',
    duration: '30-45 minutes',
    objectives: [
      'Master core concepts and terminology',
      'Understand key principles and frameworks',
      'Connect new knowledge to existing understanding'
    ],
    activities: knowledgeActivities,
    assessments: ['Concept mastery quiz', 'Knowledge application exercise']
  });

  // Phase 3: Application (strategy-based)
  const applicationActivities = [];
  if (selectedStrategy?.title?.includes('Scenario') || selectedStrategy?.title?.includes('Case')) {
    applicationActivities.push({
      type: 'Scenario Practice',
      description: 'Work through realistic scenarios with guided feedback',
      deliverable: 'Scenario solutions and reflection'
    });
  } else if (selectedStrategy?.title?.includes('Project')) {
    applicationActivities.push({
      type: 'Project Work',
      description: 'Build practical project applying learned concepts',
      deliverable: 'Completed project deliverable'
    });
  } else {
    applicationActivities.push({
      type: 'Practical Application',
      description: 'Apply concepts through hands-on exercises',
      deliverable: 'Practice exercise completion'
    });
  }

  learningMap.phases.push({
    phase: 3,
    name: 'Skill Application',
    duration: '45-60 minutes',
    objectives: [
      'Apply knowledge to practical situations',
      'Develop problem-solving capabilities',
      'Build confidence through guided practice'
    ],
    activities: applicationActivities,
    assessments: ['Performance task', 'Skill demonstration']
  });

  // Phase 4: Mastery & Integration
  learningMap.phases.push({
    phase: 4,
    name: 'Mastery & Integration',
    duration: '20-30 minutes',
    objectives: [
      'Synthesize learning across all phases',
      'Demonstrate comprehensive understanding',
      'Create personal action plan for continued development'
    ],
    activities: [
      {
        type: 'Integration Exercise',
        description: 'Complex scenario requiring synthesis of all concepts',
        deliverable: 'Comprehensive solution with justification'
      },
      {
        type: 'Action Planning',
        description: 'Develop personal implementation strategy',
        deliverable: 'Action plan document'
      }
    ],
    assessments: ['Final performance assessment', 'Peer review', 'Self-evaluation']
  });

  // Add support resources
  learningMap.supportResources = [
    'Quick reference guides and job aids',
    'Expert Q&A sessions and office hours',
    'Peer learning community access',
    'Additional practice scenarios and exercises'
  ];

  // Add success metrics
  learningMap.successMetrics = [
    'Completion of all phase assessments with 80%+ proficiency',
    'Successful demonstration of key skills in practical scenarios',
    'Positive self-assessment of confidence and competence',
    'Completion of final integration project'
  ];

  return learningMap;
}

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, domain, smeAnswers, selectedStrategy } = req.body;

    const learningMap = generateLearningMap(
      content,
      domain,
      smeAnswers,
      selectedStrategy
    );

    res.status(200).json({
      success: true,
      learningMap: learningMap,
      summary: 'Professional learning map generated based on analysis and strategy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Learning map generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Learning map generation failed',
      message: error.message
    });
  }
}
