import OpenAI from 'openai';
import { uploadedFiles } from './upload.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Calculate word count
function getWordCount(content) {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Analyze content to determine domain using AI
async function analyzeDomain(content) {
  try {
    const prompt = `You are an expert instructional designer. Analyze the following training content and classify it into ONE of these domains:

- Healthcare & Medical Education
- Technology & Software
- Business & Management
- Compliance & Regulatory
- Customer Service
- Professional Development
- Finance & Accounting
- Sales & Marketing
- Human Resources
- Engineering & Manufacturing

${content.substring(0, 4000)}

Respond with ONLY a JSON object in this exact format:
{
  "domain": "exact domain name from the list above",
  "reasoning": "2-3 sentences explaining why this content belongs to this domain based on its terminology, concepts, and learning objectives"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 200
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
    return result;
  } catch (error) {
    console.error('AI domain analysis failed, using fallback:', error.message);
    // Fallback to keyword-based analysis
    const text = content.toLowerCase();

    if (text.includes('health') || text.includes('medical') || text.includes('patient')) {
      return { domain: 'Healthcare & Medical Education', reasoning: 'Content contains healthcare-specific terminology and medical education concepts related to patient care and clinical practices.' };
    } else if (text.includes('software') || text.includes('code') || text.includes('programming')) {
      return { domain: 'Technology & Software', reasoning: 'Content focuses on technical skills, software development concepts, and technology-based learning objectives.' };
    } else if (text.includes('business') || text.includes('management') || text.includes('corporate')) {
      return { domain: 'Business & Management', reasoning: 'Content addresses business processes, organizational development, and management principles.' };
    } else {
      return { domain: 'Professional Development', reasoning: 'Content covers general professional skills and knowledge development applicable across various industries.' };
    }
  }
}

// Generate AI-powered SME questions based on content and frameworks
async function generateAISMEQuestions(content, domain, frameworks = []) {
  try {
    const frameworkContext = frameworks.length > 0
      ? `The course will use these instructional frameworks: ${frameworks.join(', ')}.`
      : '';

    const prompt = `You are an expert instructional designer creating SME (Subject Matter Expert) validation questions.

Content Domain: ${domain}
${frameworkContext}

Content Preview:
"""
${content.substring(0, 4000)}
"""

Generate 8-10 targeted SME questions that will help validate and enhance this training content. Questions should:
1. Be specific to the content and domain
2. Address practical implementation considerations
3. Align with the selected instructional frameworks
4. Help identify missing elements or improvements needed
5. Focus on learner outcomes and success criteria

${frameworks.includes('Blooms Taxonomy') ? '- Include questions about cognitive levels and learning objectives' : ''}
${frameworks.includes('ADDIE Model') ? '- Include questions about analysis, design, development, implementation, and evaluation phases' : ''}
${frameworks.includes('Kirkpatrick Model') ? '- Include questions about measuring training effectiveness and ROI' : ''}
${frameworks.includes('SAM Model') ? '- Include questions about iterative design and rapid prototyping' : ''}
${frameworks.includes("Gagné's Nine Events") ? '- Include questions about instructional events and sequencing' : ''}
${frameworks.includes("Merrill's Principles") ? '- Include questions about problem-centered instruction and activation' : ''}
${frameworks.includes("Kolb's Learning Cycle") ? '- Include questions about experiential learning and reflection' : ''}

Return ONLY a JSON array of question strings, no additional text:
["question 1", "question 2", ...]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
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
    console.log(`✅ Generated ${result.length} AI-powered SME questions`);
    return result;
  } catch (error) {
    console.error('AI SME question generation failed, using fallback:', error.message);
    // Fallback to basic questions
    return generateFallbackSMEQuestions(content, domain, frameworks);
  }
}

// Fallback SME questions if AI fails
function generateFallbackSMEQuestions(content, domain, frameworks = []) {
  const questions = [];
  const text = content.toLowerCase();

  // Always include these core questions
  questions.push(`Who is the target audience for this ${domain} training?`);

  // Framework-specific questions
  if (frameworks.includes('Blooms Taxonomy')) {
    questions.push('What cognitive levels should learners achieve (Remember, Understand, Apply, Analyze, Evaluate, Create)?');
  }
  if (frameworks.includes('ADDIE Model')) {
    questions.push('What are the key performance gaps this training should address?');
  }
  if (frameworks.includes('Kirkpatrick Model')) {
    questions.push('How will you measure the business impact and ROI of this training?');
  }

  // Domain-specific questions
  if (domain.includes('Healthcare')) {
    questions.push('What clinical competencies should learners demonstrate?');
    questions.push('Are there specific patient safety considerations to address?');
    questions.push('What regulatory compliance requirements must be met?');
  } else if (domain.includes('Technology')) {
    questions.push('What technical proficiency level is expected?');
    questions.push('Are hands-on practice exercises required?');
    questions.push('What tools or platforms will learners need access to?');
  } else if (domain.includes('Business') || domain.includes('Professional')) {
    questions.push('What business outcomes should this training achieve?');
    questions.push('How will learner performance be measured?');
    questions.push('What real-world scenarios should be included?');
  } else {
    questions.push('What practical skills should learners be able to demonstrate?');
    questions.push('How will knowledge retention be assessed?');
    questions.push('What follow-up support will learners need?');
  }

  return questions.slice(0, 10); // Return max 10 questions
}

// Generate content-based recommendations (2-4)
function generateRecommendations(content, domain) {
  const recommendations = [];
  const text = content.toLowerCase();

  if (text.length < 500) {
    recommendations.push('Expand content with more detailed examples and case studies');
  }

  if (!text.includes('example') && !text.includes('case')) {
    recommendations.push('Include real-world examples to enhance learner engagement');
  }

  if (domain.includes('Healthcare') || domain.includes('Compliance')) {
    recommendations.push('Incorporate compliance checkpoints and assessment criteria');
  } else if (domain.includes('Technology')) {
    recommendations.push('Add hands-on exercises and practical demonstrations');
  } else {
    recommendations.push('Integrate interactive elements and knowledge checks');
  }

  if (text.includes('complex') || text.includes('advanced')) {
    recommendations.push('Consider scaffolded learning approach for complex topics');
  }

  return recommendations.slice(0, 4); // Return 2-4 recommendations
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('📊 Analyze request received');

  try {
    let { content, fileName, fileId, preSMEContext } = req.body;
    console.log('📊 Request body:', { hasContent: !!content, fileName, fileId, hasPreSME: !!preSMEContext });

    // Extract frameworks from Pre-SME context
    const frameworks = preSMEContext?.instructionalFrameworks || ['Blooms Taxonomy', 'ADDIE Model'];
    console.log('🎯 Selected frameworks:', frameworks);

    // If fileId provided, get content AND PAGE DATA from uploaded files
    let pageCount = null;
    let pageMapping = null;

    if (fileId && uploadedFiles.has(fileId)) {
      const fileData = uploadedFiles.get(fileId);
      content = fileData.content;
      fileName = fileData.fileName;
      pageCount = fileData.pageCount || null;
      pageMapping = fileData.pageMapping || null;
      console.log(`📂 Retrieved file from store: ${fileName}, content length: ${content.length}, pages: ${pageCount || 'unknown'}`);
    } else if (fileId) {
      console.log(`❌ FileId ${fileId} not found in store`);
    }

    console.log('📊 Starting analysis with content length:', (content || '').length);

    // Calculate word count
    const wordCount = getWordCount(content || '');
    console.log('📊 Word count calculated:', wordCount);

    // Analyze domain based on content using AI
    console.log('🧠 Starting AI domain analysis...');
    const { domain, reasoning } = await analyzeDomain(content || '');
    console.log('🧠 AI domain analysis complete:', { domain, reasoning: reasoning.substring(0, 100) });

    // Generate AI-powered SME questions based on content and frameworks
    console.log('🧠 Generating AI-powered SME questions...');
    const smeQuestions = await generateAISMEQuestions(content || '', domain, frameworks);

    // Generate content-based recommendations
    const recommendations = generateRecommendations(content || '', domain);

    const analysis = {
      success: true,
      expert: 'Dr. Elena Rodriguez',
      fileName: fileName || 'uploaded-file',
      pageCount: pageCount,
      totalPages: pageCount,
      hasPageTracking: pageCount !== null,
      analysis: {
        domain: domain,
        reasoning: reasoning,
        wordCount: wordCount,
        pageCount: pageCount,
        totalPages: pageCount,
        summary: `Professional analysis completed for ${domain} content.`,
        recommendations: recommendations,
        smeQuestions: smeQuestions,
        defaultFrameworks: ['Blooms Taxonomy', 'ADDIE Model'], // Default pre-selected
        availableFrameworks: [
          'Blooms Taxonomy',
          'ADDIE Model',
          'SAM Model',
          'Kirkpatrick Model',
          'Gagné\'s Nine Events',
          'Merrill\'s Principles',
          'Kolb\'s Learning Cycle'
        ],
        maxFrameworkSelection: 5
      },
      content: content, // Add this
      timestamp: new Date().toISOString()
    };

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error.message
    });
  }
}

export default handler;
