# Frontend Integration Guide for Professional Analysis System

## Overview
This guide shows you how to update your existing frontend to work with the new professional analysis backend that provides detailed justifications and expert-level content analysis.

## Key Changes Required

### 1. Update API Endpoints

**Old Endpoints:**
```javascript
// OLD - Remove these
const uploadResponse = await fetch(`${BACKEND_URL}/api/upload`, {
    method: 'POST',
    body: formData
});

const analysisResponse = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId: fileId })
});
```

**New Endpoints:**
```javascript
// NEW - Use these instead
const uploadResponse = await fetch(`${BACKEND_URL}/api/content/upload-and-analyze`, {
    method: 'POST',
    body: formData
});

const statusResponse = await fetch(`${BACKEND_URL}/api/content/analysis-status/${sessionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
});
```

### 2. Update Content Upload Process

**In your `content_upload_&_processing/code.html`:**

Replace the upload function with:
```javascript
async function uploadForProfessionalAnalysis(files) {
    try {
        console.log(`🎓 Dr. Sarah Mitchell analyzing ${files.length} files...`);

        // Create FormData
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        // Upload to new professional endpoint
        const uploadResponse = await fetch(`${BACKEND_URL}/api/content/upload-and-analyze`, {
            method: 'POST',
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const result = await uploadResponse.json();
        const sessionId = result.data.sessionId;

        // Start monitoring analysis progress
        startAnalysisMonitoring(sessionId);

        return result;

    } catch (error) {
        console.error('❌ Upload failed:', error);
        throw error;
    }
}

// Monitor analysis progress
function startAnalysisMonitoring(sessionId) {
    const checkInterval = setInterval(async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/content/analysis-status/${sessionId}`);
            const result = await response.json();

            if (result.data.status === 'completed') {
                clearInterval(checkInterval);
                // Store results and navigate to results page
                localStorage.setItem('professionalAnalysisResults', JSON.stringify(result.data));
                window.location.href = '../content_analysis_results/code.html?session=' + sessionId;
            } else if (result.data.status === 'error') {
                clearInterval(checkInterval);
                showError('Analysis failed: ' + result.data.errorMessage);
            }

            // Update progress display
            updateProgressDisplay(result.data.analysisProgress, result.data.currentStep);

        } catch (error) {
            console.error('Status check failed:', error);
        }
    }, 2000); // Check every 2 seconds
}
```

### 3. Update Content Analysis Results Display

**In your `content_analysis_results/code.html`:**

Add this script to the `<head>` section:
```html
<script src="../js/professionalAnalysisIntegration.js"></script>
```

Replace your existing analysis display functions with:
```javascript
// Load analysis results on page load
document.addEventListener('DOMContentLoaded', function() {
    const analysisData = localStorage.getItem('professionalAnalysisResults');

    if (analysisData) {
        const data = JSON.parse(analysisData);
        displayProfessionalAnalysisResults(data);
    } else {
        // Try to load from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session');
        if (sessionId) {
            loadAnalysisFromSession(sessionId);
        }
    }
});

// Display professional analysis results
function displayProfessionalAnalysisResults(analysisData) {
    const analysis = analysisData.professionalAnalysis;

    // Update domain classification with reasoning
    updateDomainDisplay(analysis.domainClassification);

    // Update complexity with justification
    updateComplexityDisplay(analysis.complexityAssessment);

    // Update quality scores with detailed justifications
    updateQualityMetrics(analysis.qualityAssessment);

    // Update suitability with color coding
    updateSuitabilityDisplay(analysis.suitabilityAssessment);

    // Display gap analysis
    updateGapAnalysis(analysis.gapAnalysis);

    // Display enhancement suggestions
    updateEnhancementSuggestions(analysis.enhancementSuggestions);

    // Display SME questions
    updateSMEQuestions(analysisData.contentSpecificSMEQuestions);
}
```

### 4. Update Quality Metrics Display

Replace your quality metrics section with detailed justifications:
```javascript
function updateQualityMetrics(qualityData) {
    // Update clarity with justification
    document.getElementById('clarity-score').textContent = qualityData.clarityScore + '%';
    document.getElementById('clarity-bar').style.width = qualityData.clarityScore + '%';

    // Add justification display
    const clarityJustification = document.getElementById('clarity-justification') || createJustificationElement('clarity');
    clarityJustification.innerHTML = `
        <div class="bg-[#0D0F15] p-3 rounded-lg border border-[#3b4354] mt-2">
            <p class="text-xs text-neutral-300">
                <span class="font-bold text-[var(--primary-color)]">Dr. Sarah's Assessment:</span>
                ${qualityData.clarityJustification}
            </p>
        </div>
    `;

    // Repeat for completeness, engagement, currency
    updateMetricWithJustification('completeness', qualityData.completenessScore, qualityData.completenessJustification);
    updateMetricWithJustification('engagement', qualityData.engagementScore, qualityData.engagementJustification);
    updateMetricWithJustification('currency', qualityData.currencyScore, qualityData.currencyJustification);

    // Update overall score
    document.getElementById('overall-score').textContent = qualityData.overallScore + '%';
}

function updateMetricWithJustification(metricName, score, justification) {
    // Update score display
    const scoreElement = document.getElementById(`${metricName}-score`);
    const barElement = document.getElementById(`${metricName}-bar`);

    if (scoreElement) scoreElement.textContent = score + '%';
    if (barElement) barElement.style.width = score + '%';

    // Add/update justification
    const justificationElement = document.getElementById(`${metricName}-justification`) || createJustificationElement(metricName);
    justificationElement.innerHTML = `
        <div class="bg-[#0D0F15] p-3 rounded-lg border border-[#3b4354] mt-2">
            <p class="text-xs text-neutral-300">
                <span class="font-bold text-[var(--primary-color)]">Professional Assessment:</span>
                ${justification}
            </p>
        </div>
    `;
}
```

### 5. Add Professional Suitability Display

Add this HTML section to your results page:
```html
<div id="suitability-assessment" class="bg-[#111318] rounded-xl border border-[#282e39] p-6 mb-8">
    <h3 class="text-xl font-bold mb-4">🎯 Professional Suitability Assessment</h3>
    <div id="suitability-content">
        <!-- Will be populated by JavaScript -->
    </div>
</div>
```

And this JavaScript function:
```javascript
function updateSuitabilityDisplay(suitabilityData) {
    const suitabilityContent = document.getElementById('suitability-content');

    const colorClasses = {
        'GREEN': 'suitability-green',
        'YELLOW': 'suitability-yellow',
        'RED': 'suitability-red'
    };

    const colorClass = colorClasses[suitabilityData.colorCode] || 'bg-gray-600';
    const icon = suitabilityData.colorCode === 'GREEN' ? '✅' : suitabilityData.colorCode === 'YELLOW' ? '⚠️' : '❌';

    suitabilityContent.innerHTML = `
        <div class="${colorClass} p-6 rounded-xl text-white mb-4">
            <div class="flex items-center gap-4 mb-4">
                <span class="text-4xl">${icon}</span>
                <div>
                    <h4 class="text-2xl font-bold">${suitabilityData.level}</h4>
                    <p class="text-lg opacity-90">${suitabilityData.score}% Suitability Score</p>
                </div>
            </div>
            <p class="text-lg font-medium mb-4">${suitabilityData.recommendation}</p>
        </div>
        <div class="bg-[#0D0F15] p-4 rounded-lg border border-[#3b4354]">
            <p class="text-sm text-neutral-300">
                <span class="font-bold text-[var(--primary-color)]">Dr. Sarah's Professional Reasoning:</span>
                ${suitabilityData.reasoning}
            </p>
        </div>
    `;
}
```

### 6. Add Gap Analysis Display

Add this section to display identified gaps with recommendations:
```html
<div id="gap-analysis-section" class="bg-[#111318] rounded-xl border border-[#282e39] p-6 mb-8">
    <h3 class="text-xl font-bold mb-4">🔍 Expert Gap Analysis</h3>
    <div id="gap-analysis-content">
        <!-- Will be populated by JavaScript -->
    </div>
</div>
```

```javascript
function updateGapAnalysis(gapData) {
    const gapContent = document.getElementById('gap-analysis-content');
    const gaps = gapData.identifiedGaps || [];

    if (gaps.length === 0) {
        gapContent.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl text-green-400 mb-4">✅</div>
                <h4 class="text-xl font-bold text-green-400 mb-2">No Significant Gaps Found</h4>
                <p class="text-neutral-400">Dr. Sarah Mitchell found no major instructional gaps in your content.</p>
            </div>
        `;
        return;
    }

    const gapsHTML = gaps.map(gap => `
        <div class="bg-[#1f232e] p-4 rounded-lg border border-[#282e39] mb-4">
            <div class="flex items-center justify-between mb-3">
                <h4 class="font-bold text-white">${gap.type} Gap</h4>
                <span class="px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(gap.severity)}">${gap.severity}</span>
            </div>
            <p class="text-sm text-neutral-300 mb-3">${gap.description}</p>
            <div class="bg-[#0D0F15] p-3 rounded-lg border border-[#3b4354]">
                <p class="text-sm text-neutral-300">
                    <span class="font-bold text-[var(--primary-color)]">Dr. Sarah's Recommendation:</span>
                    ${gap.recommendation}
                </p>
            </div>
        </div>
    `).join('');

    gapContent.innerHTML = `
        <div class="mb-6">
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-[#1f232e] p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-white">${gaps.length}</div>
                    <div class="text-sm text-neutral-400">Gaps Identified</div>
                </div>
                <div class="bg-[#1f232e] p-4 rounded-lg text-center">
                    <div class="text-2xl font-bold text-white">${gapData.severity}</div>
                    <div class="text-sm text-neutral-400">Overall Severity</div>
                </div>
            </div>
        </div>
        ${gapsHTML}
    `;
}

function getSeverityColor(severity) {
    const colors = {
        'High': 'bg-red-600 text-red-100',
        'Medium': 'bg-yellow-600 text-yellow-100',
        'Low': 'bg-green-600 text-green-100'
    };
    return colors[severity] || 'bg-gray-600 text-gray-100';
}
```

### 7. Add Content-Specific SME Questions

```html
<div id="sme-questions-section" class="bg-[#111318] rounded-xl border border-[#282e39] p-6 mb-8">
    <h3 class="text-xl font-bold mb-4">❓ Content-Specific SME Questions</h3>
    <p class="text-neutral-400 mb-6">Dr. Sarah Mitchell generated these questions based on your specific content analysis:</p>
    <div id="sme-questions-content">
        <!-- Will be populated by JavaScript -->
    </div>
</div>
```

```javascript
function updateSMEQuestions(questions) {
    const smeContent = document.getElementById('sme-questions-content');

    if (!questions || questions.length === 0) {
        smeContent.innerHTML = '<p class="text-center text-neutral-400 py-4">No SME questions generated.</p>';
        return;
    }

    const questionsHTML = questions.map((q, index) => `
        <div class="bg-[#1f232e] p-4 rounded-lg border border-[#282e39] mb-4">
            <div class="flex items-center gap-3 mb-3">
                <span class="text-lg font-bold text-white">${index + 1}.</span>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary-color)] text-white">${q.category}</span>
            </div>
            <p class="text-white font-medium mb-2">${q.question}</p>
            <div class="text-xs text-neutral-400">Priority: ${q.priority}</div>
        </div>
    `).join('');

    smeContent.innerHTML = questionsHTML + `
        <div class="text-center mt-6">
            <button class="bg-[var(--primary-color)] text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors" onclick="proceedToSMEInterview()">
                Use These Questions for SME Interview
            </button>
        </div>
    `;
}

function proceedToSMEInterview() {
    // Store the questions and navigate to SME interview page
    const analysisData = localStorage.getItem('professionalAnalysisResults');
    localStorage.setItem('contentSpecificSMEQuestions', analysisData);
    window.location.href = '../content_analysis_for_sme_questions/code.html';
}
```

## Testing Your Integration

### 1. Start Your Backend
```bash
cd Backend
npm run dev
```

### 2. Test Upload Process
1. Go to your content upload page
2. Upload a PDF or DOCX file
3. Watch the console logs for professional analysis progress
4. Verify the analysis completes and shows detailed results

### 3. Verify Professional Features
- ✅ Domain classification shows specific evidence/reasoning
- ✅ Complexity assessment includes detailed justification
- ✅ Quality scores show specific justifications for each metric
- ✅ Suitability assessment uses color coding (GREEN/YELLOW/RED)
- ✅ Gap analysis shows specific recommendations
- ✅ SME questions are content-specific (not generic)
- ✅ Unsuitable content is flagged with clear reasons

### 4. Test Error Handling
- Upload an inappropriate file (like a personal resume)
- Verify it's flagged as RED/unsuitable with clear reasoning
- Test network failures and error recovery

## Next Steps

After integration:
1. Test with different content types (technical, business, healthcare)
2. Verify SME questions adapt to content domain
3. Test the complete flow from upload → analysis → SME → strategies
4. Monitor API response times and add loading states as needed

Your system will now provide professional-grade analysis with specific justifications for every assessment, just like a real instructional design expert!