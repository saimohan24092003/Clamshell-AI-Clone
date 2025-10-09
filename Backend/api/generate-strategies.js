import OpenAI from 'openai';
import Course from '../models/Course.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to set CORS headers
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

// Generate AI-powered learning strategies
async function generateLearningStrategies(content, analysisData, preSMEAnswers, smeAnswers, domain, selectedFramework, contentTopics, wordCount) {
  try {
    const prompt = `You are an experienced instructional designer and subject matter expert.

Analyze this content and recommend the 3-5 BEST instructional design strategies:

**CONTENT ANALYSIS:**
- Domain: ${domain}
- Word Count: ${wordCount || 'Not specified'}
- Content Topics: ${contentTopics || 'General training content'}
- Quality Score: ${analysisData?.qualityScore || 'Not assessed'}
- Clarity Score: ${analysisData?.clarityScore || 'Not assessed'}
- Completeness Score: ${analysisData?.completenessScore || 'Not assessed'}
- Engagement Potential: ${analysisData?.engagementScore || 'Not assessed'}

**ACTUAL CONTENT SAMPLE:**
"""
${content?.substring(0, 2000) || 'No content provided'}
"""

**SME INPUT:**
${JSON.stringify(smeAnswers, null, 2)}

**PRE-SME REQUIREMENTS:**
${JSON.stringify(preSMEAnswers, null, 2)}

**FRAMEWORK:**
${selectedFramework || 'Not specified'}

**AVAILABLE STRATEGIES (choose from these):**
1. Content Strategy - When organizing content for max engagement
2. Learner-Centered Strategy - When deep learner understanding available
3. Blended Learning Strategy - For virtual + in-person mix
4. Gamification Strategy - For motivation and engagement
5. Scenario-Based Learning - For applied knowledge
6. Microlearning Strategy - For focused 5-10 min learning
7. Collaborative Learning - For social learning value
8. Simulation/Virtual Labs - For technical/hands-on practice
9. Adaptive Learning - For diverse learner groups
10. Mobile Learning - For flexible access needs
11. Assessment-Driven - For progress measurement focus
12. Storytelling Strategy - For soft skills/culture change
13. Social Learning - For peer interaction/informal learning

**YOUR TASK:**

Recommend 3-5 strategies with:
1. Why this strategy fits THIS specific content
2. Suitability score (0-100) based on content analysis
3. Implementation timeline
4. Expected benefits for THIS content
5. Rationale explaining why for THIS domain and content

Return your response in JSON format:

{
  "strategies": [
    {
      "id": <number 1-5>,
      "name": "Strategy Name",
      "suitability": <0-100>,
      "implementation": "4-6 weeks",
      "benefits": ["benefit1", "benefit2"],
      "rationale": "Why this fits THIS specific content and domain",
      "contentRelevance": "How this applies to the actual uploaded content",
      "description": "2-3 sentences describing this strategy and why it's ideal for this content",
      "targetAudience": "Description of learners who would benefit most from this approach",
      "estimatedDuration": "Estimated course duration (e.g., '6-8 weeks', '20-30 hours')",
      "deliveryFormat": "Primary delivery method (e.g., 'Self-paced online', 'Blended learning', 'Instructor-led online')",
      "keyFeatures": [
        "Feature 1 that makes this strategy unique",
        "Feature 2 that addresses content gaps",
        "Feature 3 that leverages domain characteristics"
      ],
      "implementationSteps": [
        {
          "phase": "Phase name (e.g., 'Foundation', 'Development', 'Assessment')",
          "duration": "Time estimate",
          "activities": [
            "Specific activity 1",
            "Specific activity 2"
          ]
        }
      ],
      "assessmentApproach": "How learners will be assessed in this strategy",
      "technologyRequirements": [
        "Technology/tool requirement 1",
        "Technology/tool requirement 2"
      ],
      "expectedOutcomes": [
        "Learning outcome 1",
        "Learning outcome 2"
      ],
      "advantages": [
        "Key advantage 1 of this strategy",
        "Key advantage 2 of this strategy"
      ],
      "considerations": [
        "Important consideration 1",
        "Important consideration 2"
      ],
      "complexity": "<Low | Medium | High>",
      "resourceIntensity": "<Low | Medium | High>"
    }
  ],
  "recommendation": {
    "primaryStrategy": <id of the most recommended strategy>,
    "reasoning": "3-4 sentences explaining why this is the top recommendation based on THIS content",
    "alternativeStrategy": <id of the second-best option>,
    "alternativeReasoning": "Why this could be a good alternative for THIS content"
  },
  "domainSpecificInsights": [
    "Domain-specific insight 1 that influenced strategy selection for ${domain}",
    "Insight 2 about ${domain} learning best practices",
    "Insight 3 from SME validation that shaped recommendations"
  ]
}

**CRITICAL REQUIREMENTS:**

1. Strategies MUST be chosen from the available strategies list above
2. Base recommendations on ACTUAL content analysis - reference specific topics from the content
3. Consider SME insights when shaping strategies
4. Each strategy should be distinctly different in approach
5. Align with ${domain} domain best practices
6. Suitability scores must reflect genuine analysis of THIS content
7. rationale and contentRelevance MUST reference the actual uploaded content
8. Implementation timeline should be realistic for THIS content scope

Return ONLY the JSON object, no additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
      max_tokens: 3000
    });

    // Extract JSON from response, handling markdown code blocks
    let responseContent = response.choices[0].message.content;

    // Clean markdown formatting with robust helper function
    function cleanJsonResponse(text) {
      // Remove markdown code blocks
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      return cleaned.trim();
    }

    const cleanedResponse = cleanJsonResponse(responseContent);
    const result = JSON.parse(cleanedResponse);
    console.log('✅ AI strategies generated');
    return result;
  } catch (error) {
    console.error('AI strategy generation failed:', error.message);
    // Return fallback strategies
    return generateFallbackStrategies(domain);
  }
}

// Fallback strategies if AI fails
function generateFallbackStrategies(domain) {
  return {
    strategies: [
      {
        id: 1,
        name: "Scenario-Based Microlearning",
        description: `Transform ${domain} content into bite-sized, scenario-driven learning modules that learners can complete in 5-10 minute sessions.`,
        rationale: "Microlearning with realistic scenarios increases engagement and knowledge retention by 20-30% compared to traditional formats. This approach is particularly effective for busy professionals.",
        targetAudience: "Working professionals seeking flexible, on-the-go learning",
        estimatedDuration: "4-6 weeks, 15-20 hours total",
        deliveryFormat: "Self-paced online with mobile access",
        keyFeatures: [
          "Bite-sized modules (5-10 minutes each)",
          "Real-world scenarios and case studies",
          "Immediate knowledge checks after each module",
          "Mobile-optimized for learning on the go"
        ],
        implementationSteps: [
          {
            phase: "Content Chunking",
            duration: "1-2 weeks",
            activities: [
              "Break content into logical micro-modules",
              "Develop realistic scenarios for each module",
              "Create quick knowledge checks"
            ]
          },
          {
            phase: "Development",
            duration: "2-3 weeks",
            activities: [
              "Design interactive scenarios",
              "Develop multimedia assets",
              "Build mobile-responsive modules"
            ]
          }
        ],
        assessmentApproach: "Formative assessments after each module, culminating project",
        technologyRequirements: [
          "Mobile-friendly LMS",
          "Scenario authoring tool",
          "Analytics dashboard"
        ],
        expectedOutcomes: [
          "Improved knowledge retention",
          "Higher completion rates",
          "Better real-world application"
        ],
        advantages: [
          "Flexible learning pace",
          "High engagement through scenarios"
        ],
        considerations: [
          "Requires careful content sequencing",
          "May need additional scenario development time"
        ],
        suitabilityScore: 85,
        complexity: "Medium",
        resourceIntensity: "Medium"
      },
      {
        id: 2,
        name: "Adaptive Learning Path",
        description: `Personalized ${domain} learning experience that adapts to individual learner performance and preferences.`,
        rationale: "Adaptive learning systems have been shown to reduce learning time by 30-50% while improving outcomes. This approach is ideal for diverse learner populations.",
        targetAudience: "Learners with varying skill levels and backgrounds",
        estimatedDuration: "6-10 weeks, personalized pacing",
        deliveryFormat: "Self-paced online with AI-driven personalization",
        keyFeatures: [
          "Initial diagnostic assessment",
          "Personalized content recommendations",
          "Adaptive difficulty progression",
          "Real-time performance analytics"
        ],
        implementationSteps: [
          {
            phase: "Assessment Design",
            duration: "1 week",
            activities: [
              "Create diagnostic pre-assessment",
              "Define learning paths for different levels",
              "Establish progression criteria"
            ]
          },
          {
            phase: "Content Development",
            duration: "3-4 weeks",
            activities: [
              "Develop content for multiple difficulty levels",
              "Create branching scenarios",
              "Build remediation materials"
            ]
          }
        ],
        assessmentApproach: "Continuous adaptive assessments with personalized feedback",
        technologyRequirements: [
          "Adaptive learning platform",
          "Analytics and reporting tools",
          "Content repository system"
        ],
        expectedOutcomes: [
          "Personalized learning experience",
          "Reduced time to competency",
          "Improved learner satisfaction"
        ],
        advantages: [
          "Accommodates different skill levels",
          "Optimizes learning efficiency"
        ],
        considerations: [
          "Higher initial development cost",
          "Requires robust technology platform"
        ],
        suitabilityScore: 78,
        complexity: "High",
        resourceIntensity: "High"
      },
      {
        id: 3,
        name: "Project-Based Collaborative Learning",
        description: `Hands-on ${domain} learning through real-world projects with peer collaboration and expert mentorship.`,
        rationale: "Project-based learning improves critical thinking and problem-solving skills by 40% compared to lecture-based formats. Collaboration enhances learning through peer interaction.",
        targetAudience: "Learners seeking practical, hands-on experience",
        estimatedDuration: "8-10 weeks with structured milestones",
        deliveryFormat: "Blended learning with online collaboration and periodic virtual sessions",
        keyFeatures: [
          "Real-world project assignments",
          "Peer collaboration and feedback",
          "Expert mentor guidance",
          "Portfolio-based assessment"
        ],
        implementationSteps: [
          {
            phase: "Project Design",
            duration: "1-2 weeks",
            activities: [
              "Define authentic project scope",
              "Create collaboration guidelines",
              "Establish mentorship framework"
            ]
          },
          {
            phase: "Execution",
            duration: "6-7 weeks",
            activities: [
              "Launch foundational content",
              "Guide project teams",
              "Facilitate peer reviews and feedback"
            ]
          }
        ],
        assessmentApproach: "Portfolio assessment, peer reviews, and final project presentation",
        technologyRequirements: [
          "Collaboration platform (e.g., Microsoft Teams, Slack)",
          "Project management tools",
          "Video conferencing for synchronous sessions"
        ],
        expectedOutcomes: [
          "Practical skills application",
          "Enhanced collaboration abilities",
          "Professional portfolio pieces"
        ],
        advantages: [
          "Real-world relevance",
          "Strong peer learning component"
        ],
        considerations: [
          "Requires active facilitation",
          "May need flexible scheduling"
        ],
        suitabilityScore: 82,
        complexity: "Medium",
        resourceIntensity: "Medium"
      }
    ],
    recommendation: {
      primaryStrategy: 1,
      reasoning: "Scenario-Based Microlearning offers the best balance of engagement, flexibility, and practical application for most learners. It addresses the need for flexible learning while maintaining high engagement through realistic scenarios.",
      alternativeStrategy: 3,
      alternativeReasoning: "Project-Based Collaborative Learning provides deeper hands-on experience and is ideal if learners can commit to a more structured, collaborative format."
    },
    domainSpecificInsights: [
      `${domain} content benefits from practical, scenario-based approaches`,
      "Learners in this domain typically prefer hands-on, applicable knowledge",
      "Flexibility and real-world relevance are key success factors"
    ]
  };
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

  console.log('🎯 Strategy generation request received');

  try {
    const { content, analysisData, preSMEAnswers, smeAnswers, domain, courseId, selectedFramework, contentTopics, wordCount } = req.body;

    console.log('🧠 Generating AI-powered learning strategies...');
    console.log('📋 Domain:', domain);
    console.log('📚 Course ID:', courseId);
    console.log('💬 SME Answers:', smeAnswers?.length || 0);
    console.log('🎯 Framework:', selectedFramework || 'Not specified');
    console.log('📝 Content Topics:', contentTopics || 'Not specified');

    const strategies = await generateLearningStrategies(
      content,
      analysisData || {},
      preSMEAnswers || {},
      smeAnswers || [],
      domain || 'General',
      selectedFramework || 'Not specified',
      contentTopics || 'General training content',
      wordCount || 0
    );

    console.log('✅ Learning strategies generated');

    // Store in MongoDB if courseId is provided
    if (courseId) {
      try {
        console.log('💾 Storing strategies in MongoDB...');

        let course = await Course.findOne({ courseId });

        if (course) {
          course.strategies = strategies;
          course.updatedAt = new Date();
          await course.save();
          console.log('✅ Strategies stored in MongoDB');
        } else {
          console.log('⚠️  Course not found for strategy storage');
        }
      } catch (dbError) {
        console.error('⚠️  MongoDB storage failed:', dbError.message);
      }
    }

    res.status(200).json({
      success: true,
      strategies: strategies,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Strategy generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Strategy generation failed',
      message: error.message
    });
  }
}
