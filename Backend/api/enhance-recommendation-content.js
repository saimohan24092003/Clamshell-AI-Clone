import { withCors } from '../utils/cors.js';
import OpenAI from 'openai';
import Course from '../models/Course.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI-powered content enhancement for recommendations
async function enhanceRecommendationContent(recommendation, sourceContent, domain) {
  try {
    const prompt = `You are Dr. Elena Rodriguez, an expert instructional designer with 25+ years of experience.

A recommendation has been approved for implementation, but the user doesn't have additional documentation. Your task is to enhance the source content by adding AI-generated supplementary materials for this specific recommendation.

**Domain:** ${domain || 'General'}
**Recommendation:** ${recommendation.title || recommendation.recommendation || 'No title provided'}
**Recommendation Details:** ${recommendation.description || recommendation.rationale || 'No details provided'}

**Source Content Preview:**
"""
${sourceContent?.substring(0, 3000) || 'No source content provided'}
"""

Generate AI-enhanced supplementary content that includes:

1. **Implementation Guide** - Step-by-step instructions for implementing this recommendation
2. **Templates** - 2-3 practical templates or frameworks to support implementation
3. **Examples** - Real-world examples demonstrating the recommendation in action
4. **Best Practices** - Key best practices and tips for success
5. **Common Pitfalls** - Potential challenges and how to avoid them
6. **Assessment Criteria** - How to measure the effectiveness of this recommendation

Return the response in JSON format:
{
  "enhancedContent": {
    "implementationGuide": "Detailed step-by-step guide...",
    "templates": [
      {
        "name": "Template name",
        "description": "What this template provides",
        "content": "Template content..."
      }
    ],
    "examples": [
      {
        "title": "Example title",
        "context": "When to use this",
        "description": "Detailed example..."
      }
    ],
    "bestPractices": [
      "Best practice 1",
      "Best practice 2",
      "Best practice 3"
    ],
    "commonPitfalls": [
      {
        "pitfall": "Common mistake",
        "solution": "How to avoid it"
      }
    ],
    "assessmentCriteria": [
      {
        "criterion": "What to measure",
        "method": "How to measure it",
        "target": "Success indicator"
      }
    ]
  },
  "summary": "2-3 sentences summarizing the AI-enhanced content and its value"
}

IMPORTANT: Make the content specific to the ${domain || 'general'} domain and aligned with the recommendation details. Provide practical, actionable guidance.

Return ONLY the JSON object, no additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500
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
    console.log('✅ AI content enhancement generated');
    return result;
  } catch (error) {
    console.error('AI enhancement failed:', error.message);
    // Return fallback structure
    return generateFallbackEnhancement(recommendation, domain);
  }
}

// Fallback enhancement if AI fails
function generateFallbackEnhancement(recommendation, domain) {
  return {
    enhancedContent: {
      implementationGuide: `Follow these steps to implement the recommendation: ${recommendation.title || 'this recommendation'}:\n\n1. Review the recommendation details\n2. Assess current state\n3. Plan implementation approach\n4. Execute incrementally\n5. Evaluate and adjust`,
      templates: [
        {
          name: "Implementation Checklist",
          description: "Track implementation progress",
          content: "□ Planning complete\n□ Resources allocated\n□ Implementation started\n□ Review completed\n□ Success metrics met"
        },
        {
          name: "Progress Tracker",
          description: "Monitor implementation milestones",
          content: "Week 1: ___\nWeek 2: ___\nWeek 3: ___\nWeek 4: ___"
        }
      ],
      examples: [
        {
          title: `${domain || 'General'} Implementation Example`,
          context: "Practical application scenario",
          description: "This example demonstrates how to apply the recommendation in a real-world context within your domain."
        }
      ],
      bestPractices: [
        "Start with clear objectives and success criteria",
        "Involve stakeholders early in the process",
        "Implement incrementally and gather feedback",
        "Document lessons learned for future reference"
      ],
      commonPitfalls: [
        {
          pitfall: "Rushing implementation without proper planning",
          solution: "Take time to plan thoroughly and involve all stakeholders"
        },
        {
          pitfall: "Not measuring impact",
          solution: "Define clear metrics before starting and track progress regularly"
        }
      ],
      assessmentCriteria: [
        {
          criterion: "Implementation Completion",
          method: "Track checklist completion percentage",
          target: "100% of planned items completed"
        },
        {
          criterion: "Quality of Implementation",
          method: "Stakeholder feedback and review",
          target: "80%+ satisfaction rate"
        }
      ]
    },
    summary: "AI-generated supplementary materials including implementation guides, templates, examples, best practices, and assessment criteria to support successful implementation of this recommendation."
  };
}

async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🤖 AI content enhancement request received');

  try {
    const { recommendation, sourceContent, domain, courseId } = req.body;

    if (!recommendation) {
      return res.status(400).json({
        success: false,
        error: 'Missing recommendation data'
      });
    }

    console.log('🧠 Generating AI-enhanced content...');
    console.log('📋 Domain:', domain);
    console.log('💡 Recommendation:', recommendation.title || recommendation.recommendation);
    console.log('📚 Course ID:', courseId);

    const enhanced = await enhanceRecommendationContent(
      recommendation,
      sourceContent || '',
      domain || 'General'
    );

    console.log('✅ AI content enhancement completed');

    // Store in MongoDB if courseId is provided
    if (courseId) {
      try {
        console.log('💾 Storing enhanced content in MongoDB...');

        const course = await Course.findOne({ courseId });

        if (course) {
          // Add enhancement to recommendations array
          const recIndex = course.recommendations.findIndex(
            r => r.id === recommendation.id || r.id === recommendation.recommendationId
          );

          if (recIndex >= 0) {
            course.recommendations[recIndex].aiEnhancement = enhanced;
            course.recommendations[recIndex].status = 'approved';
            course.recommendations[recIndex].approvedAt = new Date();
          } else {
            // Add new recommendation
            course.recommendations.push({
              id: recommendation.id || recommendation.recommendationId,
              category: recommendation.category || recommendation.title,
              priority: recommendation.priority || 'Medium',
              suggestion: recommendation.suggestion || recommendation.recommendation,
              reasoning: recommendation.reasoning || recommendation.rationale,
              implementationSteps: recommendation.implementationSteps || [],
              status: 'approved',
              approvedAt: new Date(),
              aiEnhancement: enhanced
            });
          }

          // Update the latest enhanced content version
          const latestVersion = course.enhancedContent.length > 0
            ? course.enhancedContent[course.enhancedContent.length - 1]
            : null;

          if (!latestVersion || latestVersion.enhancements.length >= 5) {
            // Create new version
            course.enhancedContent.push({
              version: course.enhancedContent.length + 1,
              content: course.sourceContent,
              enhancements: [{
                recommendationId: recommendation.id || recommendation.recommendationId,
                type: 'ai_generated',
                title: recommendation.title || recommendation.category,
                enhancementData: enhanced,
                addedAt: new Date(),
                status: 'approved'
              }]
            });
          } else {
            // Add to existing version
            latestVersion.enhancements.push({
              recommendationId: recommendation.id || recommendation.recommendationId,
              type: 'ai_generated',
              title: recommendation.title || recommendation.category,
              enhancementData: enhanced,
              addedAt: new Date(),
              status: 'approved'
            });
          }

          course.updatedAt = new Date();
          course.status = 'enhanced';

          await course.save();
          console.log('✅ Enhanced content stored in MongoDB');
        } else {
          console.log('⚠️  Course not found, creating new entry...');

          // Create new course entry
          const newCourse = new Course({
            courseId,
            sourceContent: sourceContent || '',
            domain: domain || 'General',
            originalContent: {
              text: sourceContent || '',
              wordCount: (sourceContent || '').split(/\s+/).length,
              uploadedAt: new Date()
            },
            recommendations: [{
              id: recommendation.id || recommendation.recommendationId,
              category: recommendation.category || recommendation.title,
              priority: recommendation.priority || 'Medium',
              suggestion: recommendation.suggestion || recommendation.recommendation,
              reasoning: recommendation.reasoning || recommendation.rationale,
              implementationSteps: recommendation.implementationSteps || [],
              status: 'approved',
              approvedAt: new Date(),
              aiEnhancement: enhanced
            }],
            enhancedContent: [{
              version: 1,
              content: sourceContent || '',
              enhancements: [{
                recommendationId: recommendation.id || recommendation.recommendationId,
                type: 'ai_generated',
                title: recommendation.title || recommendation.category,
                enhancementData: enhanced,
                addedAt: new Date(),
                status: 'approved'
              }]
            }],
            status: 'enhanced'
          });

          await newCourse.save();
          console.log('✅ New course entry created with enhanced content');
        }
      } catch (dbError) {
        console.error('⚠️  MongoDB storage failed:', dbError.message);
        // Don't fail the request, just log the error
      }
    }

    res.status(200).json({
      success: true,
      enhanced: enhanced,
      timestamp: new Date().toISOString(),
      storedInDB: !!courseId
    });
  } catch (error) {
    console.error('❌ Enhancement error:', error);
    res.status(500).json({
      success: false,
      error: 'Content enhancement failed',
      message: error.message
    });
  }
}

export default withCors(handler);
