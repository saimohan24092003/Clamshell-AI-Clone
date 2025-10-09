# Learning Map - Quick Reference Guide

## New Format Structure

### JSON Structure
```json
{
  "headerSection": {
    "customerName": "string",
    "projectName": "string",
    "sourceContent": "string",
    "learnerPersona": "string (detailed)",
    "courseStorySummary": "string (narrative)"
  },
  "modules": [
    {
      "moduleNumber": 1,
      "moduleTitle": "string (with duration)",
      "moduleStory": "string (narrative)",
      "topics": [
        {
          "topicName": "string",
          "sourceContentPageReference": "string or -",
          "estimatedSeatTime": number (minutes),
          "learningFormat": "string",
          "whatHappensOnScreen": "string (detailed)"
        }
      ],
      "moduleTotalTime": number (sum of topics)
    }
  ],
  "documentObjective": "string"
}
```

---

## Learning Format Options

| Format | Use Case | Example |
|--------|----------|---------|
| Animated Video | Introductions, overviews | Opening video showing system components |
| Static screen | Objectives, welcome | Learning objectives with bullet points |
| Interactive Visualization | Data, diagrams | Clickable diagram of architecture |
| Interactive Scenario | Challenges, examples | Email correspondence about problems |
| Interactive Timeline | Historical progression | Evolution of technology over time |
| Interactive Diagram | Comparisons | Side-by-side comparison of options |
| Interactive Quiz | Knowledge checks | Multiple-choice scenario questions |

---

## Excel Sections

### Section 1: Header (2-column layout)
- Row 1: Customer Name | [Value]
- Row 2: Project Name | [Value]
- Row 3: Source Content | [Value]
- Row 4: Learner Persona | [Value]
- Row 5: Course Story Summary | [Value]
- Row 6: Empty

### Section 2: Module Header (Yellow)
- Row N: Module [#]: [Title] (Duration)
- Row N+1: Empty
- Row N+2: Module Story | [Narrative]
- Row N+3: Empty

### Section 3: Topics Table (5 columns)
- Header Row: Topics | Source Content Page Reference | Estimated Seat Time (minutes) | Learning Format | What Happens on Screen
- Data Rows: Topic details
- Total Row: Module [#] Total | | [Sum] | |

### Section 4: Document Objective
- Row: Document Objective
- Row: [Objective text]

---

## Column Widths (Excel)
```javascript
[
  { wch: 35 },  // Topics / Labels
  { wch: 25 },  // Source Content Page Reference / Values
  { wch: 20 },  // Estimated Seat Time
  { wch: 30 },  // Learning Format
  { wch: 70 }   // What Happens on Screen
]
```

---

## Color Scheme (HTML Display)

| Element | Color Class | Background |
|---------|------------|------------|
| Module Header | `bg-yellow-500/20` | Yellow transparent |
| Module Story | `bg-gray-800/30` | Gray transparent |
| Topics Header | `bg-purple-900/40` | Purple transparent |
| Topic Rows (even) | `bg-gray-800/20` | Gray transparent |
| Topic Rows (odd) | `bg-gray-900/20` | Darker gray |
| Module Total | `bg-green-900/30` | Green transparent |

---

## Timing Guidelines

| Content Type | Estimated Time |
|-------------|----------------|
| Opening Video | 2 minutes |
| Welcome Screen | 1 minute |
| Learning Objectives | 1 minute |
| Interactive Visualization | 3-8 minutes |
| Interactive Scenario | 2.5-5 minutes |
| Interactive Timeline | 5-10 minutes |
| Interactive Diagram | 8-15 minutes |
| Knowledge Check/Quiz | 5 minutes |

**Module Total**: Typically 30-60 minutes per module

---

## AI Prompt Requirements

### Must Include
1. Customer name
2. Project name
3. Domain classification
4. Selected strategy
5. Content sample (first 3000 chars)
6. SME answers (if available)
7. Pre-SME data (client/project info)

### Must Generate
1. Learner persona (detailed description)
2. Course story summary (narrative)
3. Module titles (content-specific)
4. Module stories (narratives)
5. Topic names (from content)
6. Learning formats (strategy-appropriate)
7. Screen activities (specific descriptions)
8. Source references (document sections)
9. Realistic timing (based on word count)
10. Document objective (summary)

---

## Common Patterns

### Module Title Pattern
```
Module [#]: [Content-Specific Topic] ([Duration] minutes)

Example: Module 1: Understanding OGC APIs (30 minutes)
```

### Module Story Pattern
```
In the [ordinal] module, learners [action] [topic] and explore [outcome/benefit].

Example: In the first module, learners discover the fundamental concepts of
OGC APIs and explore how these modern standards revolutionize geospatial
data publishing.
```

### Topic Progression Pattern
1. Opening Video (2 min)
2. Welcome (1 min)
3. Core Concept 1 (3-8 min)
4. The Challenge/Scenario (2.5-5 min)
5. Learning Objectives (1 min)
6. Core Concept 2 (5-10 min)
7. Core Concept 3 (8-15 min)
8. Knowledge Check (5 min)

**Total**: 27.5-47 minutes

---

## API Endpoints

### Generate Learning Map
```javascript
POST http://localhost:3000/api/generate-learning-map-ai

Body: {
  selectedStrategy: { id, name, ... },
  content: "string",
  analysisData: { ... },
  domain: "string",
  recommendations: [...],
  courseId: "string",
  smeAnswers: [...],
  preSMEAnswers: { ... },
  clientName: "string",
  projectName: "string",
  contentTopics: "string",
  wordCount: number,
  qualityMetrics: { ... }
}

Response: {
  success: true,
  learningMap: { ... },
  timestamp: "ISO string"
}
```

---

## Error Handling

### AI Generation Fails
- Falls back to `generateFallbackLearningMap()`
- Uses domain, client name, project name
- Generates 1 sample module with topics
- Logs error and continues

### Missing Data
- Uses "TBD" for customer name
- Uses domain + "Professional Training" for project name
- Generates generic learner persona
- Creates basic course story

### Display Issues
- Gracefully handles old format data
- Shows what data is available
- Calculates totals from available data
- Displays empty state if no modules

---

## Validation Checklist

Before considering the learning map complete, verify:

- [ ] Customer name is real (not "TBD" or generic)
- [ ] Project name is descriptive and content-specific
- [ ] Learner persona is detailed (not generic)
- [ ] Course story summary tells a narrative
- [ ] Module titles reference actual content
- [ ] Module stories use storytelling language
- [ ] Topics are content-specific (not generic)
- [ ] Learning formats match the strategy
- [ ] Screen activities are detailed
- [ ] Source references point to actual sections
- [ ] Timing is realistic for content length
- [ ] Module totals sum correctly
- [ ] Document objective is clear

---

## Keyboard Shortcuts (for Testing)

### Browser Console
```javascript
// View learning map data
console.log(comprehensiveLearningMapData)

// Check localStorage
console.log(localStorage.getItem('generatedLearningMap'))

// Test download
downloadComprehensiveLearningMap()

// Setup test data
setupTestData()
```

---

## Troubleshooting

### Issue: Generic content appears
**Solution**: Check if AI backend is running. Fallback generates generic content.

### Issue: Excel download fails
**Solution**: Verify XLSX library loaded. Check browser console for errors.

### Issue: Topics not showing
**Solution**: Verify `modules[].topics` array exists in data. Check new format.

### Issue: Timing incorrect
**Solution**: Check `moduleTotalTime` field. Verify `estimatedSeatTime` values.

### Issue: Module stories missing
**Solution**: AI may not have generated stories. Check `moduleStory` field.

---

## Best Practices

1. **Always run AI backend** for proper learning map generation
2. **Provide real content** for content-specific topics
3. **Complete pre-SME form** for accurate customer/project info
4. **Select appropriate strategy** for correct learning formats
5. **Review Excel output** before sharing with clients
6. **Test with various content types** to ensure robustness
7. **Keep modules focused** (30-60 minutes each)
8. **Use storytelling** in personas and module stories
9. **Be specific** in "What Happens on Screen" descriptions
10. **Reference sources** accurately with page numbers

---

## File Locations

```
Backend/
  api/
    generate-learning-map-ai.js     ← AI prompt & generation logic

public/
  stitch_welcome_\_login/
    personalized_learning_map/
      code.html                     ← Display & Excel export

Documentation/
  LEARNING_MAP_REBUILD_SUMMARY.md   ← Complete rebuild details
  BEFORE_AFTER_COMPARISON.md        ← Format comparison
  QUICK_REFERENCE_GUIDE.md          ← This file
```

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify backend server is running (localhost:3000)
3. Review generated JSON structure
4. Compare with reference images
5. Check LEARNING_MAP_REBUILD_SUMMARY.md for details
