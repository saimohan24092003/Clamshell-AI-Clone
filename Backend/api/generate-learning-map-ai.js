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

// Get strategy-specific guidance for AI
function getStrategySpecificGuidance(strategyName) {
  const guidance = {
    'Scenario-Based Microlearning': `
- Create 5-7 minute bite-sized modules
- Each topic should present a real-world scenario
- Include decision-making points and immediate feedback
- Use branching scenarios where appropriate
- Focus on practical application over theory`,

    'Gamification': `
- Design modules as game levels with increasing difficulty
- Include points, badges, and achievement systems
- Create challenges and competitions
- Use game mechanics (quests, unlockables, leaderboards)
- Make learning feel like playing a game`,

    'Action Mapping': `
- Start with real business goals and actions
- Design activities that practice actual job tasks
- Minimize information dumps - focus on DO, not KNOW
- Create realistic practice scenarios
- Include performance support tools`,

    'Adaptive Learning': `
- Create multiple learning paths based on learner performance
- Include diagnostic assessments
- Provide personalized content recommendations
- Allow learners to skip mastered content
- Adjust difficulty dynamically`,

    'Social Learning': `
- Incorporate peer discussion and collaboration
- Include group activities and projects
- Design for knowledge sharing and mentoring
- Use community forums and social features
- Encourage learner-generated content`,

    'Blended Learning': `
- Mix online and offline activities
- Include synchronous and asynchronous elements
- Design for multiple delivery modes
- Create cohesive experience across formats
- Balance self-paced and instructor-led content`
  };

  return guidance[strategyName] || `
- Tailor modules to the unique characteristics of ${strategyName}
- Ensure activities align with the strategy's core principles
- Create engaging, strategy-appropriate assessments
- Design for the target audience and delivery format`;
}

// Generate comprehensive learning map based on selected strategy
async function generateLearningMap(selectedStrategy, content, analysisData, domain, recommendations, smeAnswers, preSMEAnswers, clientName, projectName, courseId, contentTopics, wordCount, qualityMetrics, pageCount, fileName) {
  try {
    const prompt = `You are a senior instructional designer creating a professional learning map document.

CUSTOMER & PROJECT INFORMATION:
- Customer Name: ${clientName || 'TBD'}
- Project Name: ${projectName || 'E-Learning Course'}
- Domain: ${domain}
- Selected Strategy: ${selectedStrategy.name}

CONTENT ANALYSIS:
- Source File: ${fileName || 'Uploaded Content'}
- Total Pages: ${pageCount || 'Unknown'}
- Content Topics: ${contentTopics}
- Word Count: ${wordCount}
- Quality Metrics: ${JSON.stringify(qualityMetrics)}

SME VALIDATION:
${JSON.stringify(smeAnswers, null, 2)}

PRE-SME REQUIREMENTS:
${JSON.stringify(preSMEAnswers, null, 2)}

ACTUAL CONTENT SAMPLE:
"""
${content?.substring(0, 4000) || 'No content provided'}
"""

Create a professional learning map with 2 to 3 modules based on the content provided.

Create a professional learning map with 3 modules based on the content provided.
Follow this EXACT structure and use the examples provided as a guide:

{
  "headerSection": {
    "customerName": "${clientName}",
    "projectName": "Descriptive project name based on content",
    "sourceContent": "${fileName || 'Uploaded Content'}${pageCount ? ' (' + pageCount + ' pages)' : ''}",
    "learnerPersona": "Detailed description of target learners (e.g., 'IT professionals with intermediate experience in software development...')",
    "courseStorySummary": "Narrative about learner's journey through the course (e.g., 'Meet Alex, a software developer with 4 years of experience...')"
  },
  "modules": [
    {
      "moduleNumber": 1,
      "moduleTitle": "Introduction to Fireworks Safety (30 minutes)",
      "moduleStory": "In this module, learners are introduced to the importance of fireworks safety. Alex learns about the potential risks and the legal regulations surrounding fireworks handling. The module sets the foundation for understanding why.",
      "topics": [
        { "topicName": "Opening Video", "sourceContentPageReference": "-", "estimatedSeatTime": 2, "learningFormat": "Animated Video", "whatHappensOnScreen": "Dynamic visualization showing the evolution of software tools over the years and their impact on the tech industry." },
        { "topicName": "Welcome", "sourceContentPageReference": "-", "estimatedSeatTime": 1, "learningFormat": "Static screen", "whatHappensOnScreen": "A welcoming screen with engaging visuals and a brief overview of what learners will cover in the course." },
        { "topicName": "Understanding Fireworks Regulations", "sourceContentPageReference": "Content Section 1", "estimatedSeatTime": 5, "learningFormat": "Interactive Visualization", "whatHappensOnScreen": "An interactive diagram that outlines key fireworks regulations. Learners click on different sections to reveal detailed information about each regulation." },
        { "topicName": "The Challenge of Fireworks Safety", "sourceContentPageReference": "Context Section", "estimatedSeatTime": 3, "learningFormat": "Interactive Scenario", "whatHappensOnScreen": "A scenario where Alex receives emails about safety compliance challenges faced by previous volunteers, prompting learners to analyze and discuss the issues." },
        { "topicName": "Learning Objectives", "sourceContentPageReference": "-", "estimatedSeatTime": 1, "learningFormat": "Static screen", "whatHappensOnScreen": "A clear display of the learning objectives, including visuals that illustrate key safety concepts." },
        { "topicName": "Key Safety Protocols", "sourceContentPageReference": "Content Section 2", "estimatedSeatTime": 8, "learningFormat": "Interactive Timeline", "whatHappensOnScreen": "Learners can interact with points on the timeline to explore specific safety measures." },
        { "topicName": "Common Misconceptions about Fireworks", "sourceContentPageReference": "Content Section 3", "estimatedSeatTime": 10, "learningFormat": "Interactive Diagram", "whatHappensOnScreen": "A visual comparison of common misconceptions versus facts about fireworks safety. Learners can hover over each misconception to reveal the truth." },
        { "topicName": "Knowledge Check", "sourceContentPageReference": "-", "estimatedSeatTime": 5, "learningFormat": "Interactive Quiz", "whatHappensOnScreen": "A series of scenario-based questions that test learners on the safety protocols and regulations discussed in the module." }
      ],
      "moduleTotalTime": 30
    },
    {
      "moduleNumber": 2,
      "moduleTitle": "Fireworks Handling Techniques (28 minutes)",
      "moduleStory": "This module dives deeper into the practical aspects of fireworks handling. Alex learns about the proper techniques for setting up and igniting fireworks safely, as well as the importance of personal protective equipment.",
      "topics": [
        { "topicName": "Best Practices for Fireworks Handling", "sourceContentPageReference": "Content Section 4", "estimatedSeatTime": 10, "learningFormat": "Interactive Visualization", "whatHappensOnScreen": "A clickable infographic that outlines best practices for handling fireworks. Each click reveals tips and safety reminders." },
        { "topicName": "Personal Protective Equipment", "sourceContentPageReference": "Content Section 5", "estimatedSeatTime": 8, "learningFormat": "Interactive Scenario", "whatHappensOnScreen": "for different fireworks handling situations, with feedback provided on their choices." },
        { "topicName": "Setup and Ignition Procedures", "sourceContentPageReference": "Content Section 6", "estimatedSeatTime": 7, "learningFormat": "Interactive Video", "whatHappensOnScreen": "An interactive video demonstrating the correct setup and ignition procedures, with pauses for learners to answer questions about what they observe." },
        { "topicName": "Knowledge Check", "sourceContentPageReference": "-", "estimatedSeatTime": 3, "learningFormat": "Interactive Quiz", "whatHappensOnScreen": "A quiz featuring multiple-choice questions about handling techniques and equipment, reinforcing key learnings from the module." }
      ],
      "moduleTotalTime": 28
    },
    {
      "moduleNumber": 3,
      "moduleTitle": "Emergency Response and Safety Protocols (32 minutes)",
      "moduleStory": "In this module, Alex learns how to respond to emergencies and the safety protocols that must be followed. The focus is on preparing for the unexpected and ensuring the safety of all participants.",
      "topics": [
        { "topicName": "Emergency Response Procedures", "sourceContentPageReference": "Content Section 7", "estimatedSeatTime": 10, "learningFormat": "Interactive Scenario", "whatHappensOnScreen": "A scenario simulation where learners must make decisions during a fireworks-related emergency, with consequences based on their choices." },
        { "topicName": "Reporting Incidents", "sourceContentPageReference": "Content Section 8", "estimatedSeatTime": 8, "learningFormat": "Interactive Visualization", "whatHappensOnScreen": "An interactive flowchart that guides learners through the steps for reporting incidents, with visuals to illustrate each step." },
        { "topicName": "Community Safety Initiatives", "sourceContentPageReference": "Content Section 9", "estimatedSeatTime": 7, "learningFormat": "Interactive Video", "whatHappensOnScreen": "A video showcasing community safety initiatives related to fireworks, with prompts for learners to reflect on how they can contribute." },
        { "topicName": "Knowledge Check", "sourceContentPageReference": "-", "estimatedSeatTime": 7, "learningFormat": "Interactive Quiz", "whatHappensOnScreen": "A series of scenario-based questions that assess learners' understanding of emergency response and safety protocols." }
      ],
      "moduleTotalTime": 32
    }
  ],
  "documentObjective": "The objective of this document is to identify the structure and thread grade of our approach for teaching fireworks safety training for volunteers through a Microlearning Strategy, using engaging scenarios and interactive content."
}

CRITICAL REQUIREMENTS FOR SOURCE CONTENT PAGE REFERENCES:
${pageCount ? `
1. ACTUAL PAGE NUMBERS: The source content has ${pageCount} pages. Use REAL page numbers:
   - For content-based topics: Use "Page X" or "Pages X-Y" format
   - Distribute topics across the ${pageCount} pages logically
   - Example: "Pages 1-5", "Page 8", "Pages 12-15"
` : `
1. SECTION REFERENCES: Since no page info is available, use descriptive references:
   - Use "Section 1", "Chapter 2", "Introduction", etc.
   - Example: "Content Section 2", "Chapter 3: Implementation"
`}
2. NON-CONTENT TOPICS: Use "-" for:
   - Introduction/welcome screens
   - Knowledge checks/assessments
   - Summary/review screens
3. Extract topics from ACTUAL uploaded content (NOT generic placeholders)
4. Module titles should reflect real content structure
5. Learning formats should match the strategy: ${selectedStrategy.name}
6. Seat times should be realistic based on ${wordCount} words
7. "What Happens on Screen" must be SPECIFIC to the content
8. Learner Persona should describe REAL target audience
9. Course Story Summary should tell a STORY about a learner
10. Make it look EXACTLY like the professional reference format

PAGE REFERENCE EXAMPLES:
${pageCount ? `
- "Pages 1-3" for introduction topics covering first few pages
- "Page 5" for a specific concept from page 5
- "Pages 8-12" for main content spanning multiple pages
- "-" for assessments and non-content screens
` : `
- "Introduction Section" for opening content
- "Chapter 2" for specific chapters
- "Content Framework" for main content
- "-" for assessments and non-content screens
`}

LEARNING FORMATS to use (based on ${selectedStrategy.name}):
- Animated Video (for introductions, visualizations)
- Static screen (for objectives, welcome screens)
- Interactive Visualization (for data, diagrams)
- Interactive Scenario (for challenges, real-world examples)
- Interactive Timeline (for historical progression)
- Interactive Diagram (for comparisons, overviews)
- Interactive Quiz (for knowledge checks)

Return ONLY valid JSON matching the exact structure above.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 4000
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
    console.log('✅ AI learning map generated');
    return result;
  } catch (error) {
    console.error('AI learning map generation failed:', error.message);
    // Return fallback learning map
    return generateFallbackLearningMap(selectedStrategy, domain, clientName, projectName, fileName, pageCount);
  }
}

// Fallback learning map if AI fails - NEW PROFESSIONAL FORMAT
function generateFallbackLearningMap(selectedStrategy, domain, clientName, projectName, fileName, pageCount) {
  return {
    headerSection: {
      customerName: clientName || 'To Be Determined',
      projectName: projectName || `${domain} Professional Training`,
      sourceContent: `${fileName || 'Uploaded Content'}${pageCount ? ` (${pageCount} pages)` : ''}`,
      learnerPersona: `Professionals seeking to develop skills in ${domain}. They have basic knowledge but need comprehensive training on advanced concepts and practical implementation.`,
      courseStorySummary: `Throughout this course, learners will progress from foundational understanding to advanced mastery of ${domain}, using ${selectedStrategy.name} approach to ensure practical skill development and real-world application readiness.`
    },
    modules: [
      {
        moduleNumber: 1,
        moduleTitle: `Introduction to ${domain} (30 minutes)`,
        moduleStory: `In the first module, learners discover the fundamental concepts of ${domain} and explore how these principles can be effectively applied in their professional context.`,
        topics: [
          {
            topicName: "Opening Video",
            sourceContentPageReference: "-",
            estimatedSeatTime: 2,
            learningFormat: "Animated Video",
            whatHappensOnScreen: `Dynamic visualization showing different aspects of ${domain} and their real-world applications`
          },
          {
            topicName: "Welcome",
            sourceContentPageReference: "-",
            estimatedSeatTime: 1,
            learningFormat: "Static screen",
            whatHappensOnScreen: `Course introduction with visual ${domain} representation and learning path overview`
          },
          {
            topicName: `Understanding ${domain} Basics`,
            sourceContentPageReference: "Content Pages 1-5",
            estimatedSeatTime: 8,
            learningFormat: "Interactive Visualization",
            whatHappensOnScreen: `Clickable diagram showing key ${domain} concepts and their relationships`
          },
          {
            topicName: "The Challenge",
            sourceContentPageReference: "Context documentation",
            estimatedSeatTime: 3,
            learningFormat: "Interactive Scenario",
            whatHappensOnScreen: `Email correspondence about common ${domain} challenges faced by professionals`
          },
          {
            topicName: "Learning Objectives",
            sourceContentPageReference: "-",
            estimatedSeatTime: 1,
            learningFormat: "Static screen",
            whatHappensOnScreen: `Clear presentation of module goals with practical ${domain} examples`
          },
          {
            topicName: `${domain} Framework Overview`,
            sourceContentPageReference: "Content Pages 6-10",
            estimatedSeatTime: 10,
            learningFormat: "Interactive Diagram",
            whatHappensOnScreen: `Visual framework showing the complete ${domain} ecosystem and components`
          },
          {
            topicName: "Knowledge Check",
            sourceContentPageReference: "-",
            estimatedSeatTime: 5,
            learningFormat: "Interactive Quiz",
            whatHappensOnScreen: `Scenario-based questions testing understanding of core ${domain} principles`
          }
        ],
        moduleTotalTime: 30
      }
    ],
    documentObjective: `The objective of this document is to identify the structure and approach for teaching ${domain} through ${selectedStrategy.name} methodology, using interactive content and practical examples to ensure learner mastery.`
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

  console.log('🗺️  Learning map generation request received');

  try {
    const {
      selectedStrategy,
      content,
      analysisData,
      domain,
      recommendations,
      courseId,
      smeAnswers,
      preSMEAnswers,
      clientName,
      projectName,
      contentTopics,
      wordCount,
      qualityMetrics
    } = req.body;

    if (!selectedStrategy) {
      return res.status(400).json({
        success: false,
        error: 'Missing selected strategy'
      });
    }

    console.log('🧠 Generating CUSTOMIZED AI-powered learning map...');
    console.log('👤 Client Name:', clientName || 'To Be Determined');
    console.log('📋 Domain:', domain);
    console.log('🎯 Strategy:', selectedStrategy.name);
    console.log('📚 Course ID:', courseId);
    console.log('💬 SME Answers:', smeAnswers?.length || 0, 'responses');
    console.log('📝 Pre-SME:', preSMEAnswers ? Object.keys(preSMEAnswers).length + ' fields' : 'None');
    console.log('📑 Content Topics:', contentTopics || 'Not specified');

    const learningMap = await generateLearningMap(
      selectedStrategy,
      content || '',
      analysisData || {},
      domain || 'General',
      recommendations || [],
      smeAnswers || [],
      preSMEAnswers || {},
      clientName || 'To Be Determined',
      projectName || courseId || 'Unnamed Project',
      courseId,
      contentTopics || 'Not specified',
      wordCount || 0,
      qualityMetrics || analysisData || {},
      analysisData.data.pageCount,
      analysisData.data.fileName
    );

    console.log('✅ Learning map generated');

    // Store in MongoDB if courseId is provided
    if (courseId) {
      try {
        console.log('💾 Storing learning map in MongoDB...');

        let course = await Course.findOne({ courseId });

        if (course) {
          course.learningMap = learningMap;
          course.selectedStrategy = {
            strategyId: selectedStrategy.id,
            selectedAt: new Date()
          };
          course.status = 'completed';
          course.updatedAt = new Date();
          await course.save();
          console.log('✅ Learning map stored in MongoDB');
        } else {
          console.log('⚠️  Course not found for learning map storage');
        }
      } catch (dbError) {
        console.error('⚠️  MongoDB storage failed:', dbError.message);
      }
    }

    res.status(200).json({
      success: true,
      learningMap: learningMap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Learning map generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Learning map generation failed',
      message: error.message
    });
  }
}
