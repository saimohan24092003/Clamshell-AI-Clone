
// Generate strategy recommendations based on content analysis and SME answers
function generateStrategyRecommendations(content, domain, smeAnswers, frameworks) {
  const strategies = [];

  // Analyze content and SME answers
  const hasComplexContent = content?.toLowerCase().includes('complex') || content?.toLowerCase().includes('advanced');
  const hasPracticalFocus = smeAnswers?.some(a => a.toLowerCase().includes('practical') || a.toLowerCase().includes('hands-on'));
  const hasAssessmentNeeds = smeAnswers?.some(a => a.toLowerCase().includes('assess') || a.toLowerCase().includes('measure'));

  // Strategy 1: Based on domain and content complexity
  if (domain.includes('Healthcare')) {
    strategies.push({
      title: 'Scenario-Based Medical Training',
      description: 'Implement realistic patient scenarios with decision-making checkpoints to develop clinical judgment',
      rationale: 'Healthcare education requires practical application in safe, simulated environments',
      implementation: [
        'Develop 3-5 patient case studies reflecting real-world complexity',
        'Include decision trees for critical clinical pathways',
        'Incorporate feedback loops for learner reflection'
      ]
    });
  } else if (domain.includes('Technology')) {
    strategies.push({
      title: 'Project-Based Learning with Live Coding',
      description: 'Structure learning around building a complete project with incremental skill development',
      rationale: 'Technical skills are best learned through practical application and iterative development',
      implementation: [
        'Break down project into manageable sprints',
        'Provide code templates and scaffolding for beginners',
        'Include peer code review and debugging exercises'
      ]
    });
  } else if (domain.includes('Compliance')) {
    strategies.push({
      title: 'Checkpoint-Based Compliance Training',
      description: 'Sequential learning modules with mandatory knowledge verification at each stage',
      rationale: 'Compliance training requires verified comprehension before progression',
      implementation: [
        'Design modular content with clear compliance objectives',
        'Include scenario-based assessment at each checkpoint',
        'Implement certification tracking and reporting'
      ]
    });
  }

  // Strategy 2: Based on frameworks selected
  if (frameworks?.includes('Blooms Taxonomy')) {
    strategies.push({
      title: 'Progressive Cognitive Development',
      description: 'Structure content following Bloom\'s taxonomy from knowledge to evaluation',
      rationale: 'Systematic progression through cognitive levels ensures comprehensive learning',
      implementation: [
        'Start with foundational knowledge and terminology',
        'Progress to application through practical exercises',
        'Culminate with analysis and evaluation activities'
      ]
    });
  }

  // Strategy 3: Based on SME answers about assessment
  if (hasAssessmentNeeds) {
    strategies.push({
      title: 'Formative Assessment Integration',
      description: 'Embed continuous assessment throughout learning journey',
      rationale: 'Regular feedback improves retention and identifies knowledge gaps early',
      implementation: [
        'Include micro-assessments after each major concept',
        'Provide immediate, specific feedback',
        'Offer remediation paths for struggling learners'
      ]
    });
  }

  // Strategy 4: If practical/hands-on focus
  if (hasPracticalFocus) {
    strategies.push({
      title: 'Experiential Learning Approach',
      description: 'Maximize hands-on practice with guided reflection',
      rationale: 'Practical skills require active practice and immediate application',
      implementation: [
        'Allocate 60-70% of learning time to active practice',
        'Include guided practice sessions with expert modeling',
        'Incorporate reflection activities after each practice session'
      ]
    });
  }

  return strategies.slice(0, 4); // Return top 3-4 strategies
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, domain, smeAnswers, selectedFrameworks } = req.body;

    const strategies = generateStrategyRecommendations(
      content,
      domain,
      smeAnswers,
      selectedFrameworks
    );

    res.status(200).json({
      success: true,
      strategies: strategies,
      summary: `Generated ${strategies.length} evidence-based instructional strategies`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Strategy generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Strategy generation failed',
      message: error.message
    });
  }
}

export default handler;
