# Quick Reference: Learning Map Professional Colors

## EXACT COLOR CODES FROM REFERENCE

### Header Section
```css
Customer Name Label:     #D3D3D3  (Light Gray, Bold)
Project Name Label:      #D3D3D3  (Light Gray, Bold)
Source Content Label:    #D3D3D3  (Light Gray, Bold)
Learner Persona Label:   #D3D3D3  (Light Gray, Bold)
Learner Persona VALUE:   #FFFF00  (Yellow Highlight) ⭐
Course Story Label:      #D3D3D3  (Light Gray, Bold)
```

### Module Sections
```css
Module Header:           #FFFF00  (Yellow, Bold) ⭐
Module Story:            #E6F2FF  (Light Blue, Italic) ⭐
Table Headers:           #D3D3D3  (Light Gray, Bold)
Topic Row (Even):        #FFFFFF  (White)
Topic Row (Odd):         #F9F9F9  (Very Light Gray)
Module Total Row:        #D4EDDA  (Light Green, Bold)
```

### Text and Borders
```css
All Text:                #000000  (Black)
Cell Borders:            #CCCCCC  (Light Gray, Thin)
```

## ARGB FORMAT FOR EXCELJS

```javascript
const COLORS = {
    HEADER_GRAY:    'FFD3D3D3',  // Light gray
    YELLOW:         'FFFFFF00',  // Yellow highlight
    LIGHT_BLUE:     'FFE6F2FF',  // Module story
    WHITE:          'FFFFFFFF',  // Even rows
    LIGHT_GRAY:     'FFF9F9F9',  // Odd rows
    LIGHT_GREEN:    'FFD4EDDA',  // Total rows
    BLACK_TEXT:     'FF000000',  // All text
    GRAY_BORDER:    'FFCCCCCC'   // Borders
};
```

## CSS CLASS REFERENCE

```css
.header-label-cell              → #D3D3D3 (gray label)
.header-value-cell              → #FFFFFF (white value)
.learner-persona-highlight      → #FFFF00 (yellow persona)
.module-header-row              → #FFFF00 (yellow module title)
.module-story-row               → #E6F2FF (blue story)
.topics-table th                → #D3D3D3 (gray headers)
.table-row-even                 → #FFFFFF (white)
.table-row-odd                  → #F9F9F9 (light gray)
.module-total-row               → #D4EDDA (light green)
```

## VISUAL LAYOUT

```
┌─────────────────────────────────────────────────────────────┐
│ Customer Name: [GRAY] │ OGC [WHITE]                         │
├─────────────────────────────────────────────────────────────┤
│ Project Name: [GRAY]  │ Publishing Open Data... [WHITE]     │
├─────────────────────────────────────────────────────────────┤
│ Source Content: [GRAY]│ Content.pdf [WHITE]                 │
├─────────────────────────────────────────────────────────────┤
│ Learner Persona: [GRAY]│ Developers at NMCAs... [YELLOW] ⭐│
├─────────────────────────────────────────────────────────────┤
│ Course Story: [GRAY]  │ Annabel, a geospatial... [WHITE]    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Module 1: Understanding OGC APIs (30 min) [YELLOW] ⭐       │
├─────────────────────────────────────────────────────────────┤
│ Module Story: In the first module... [LIGHT BLUE] ⭐        │
├───────────┬──────────┬────────┬──────────┬─────────────────┤
│ Topics    │ Page Ref │ Time   │ Format   │ What Happens    │
│ [GRAY]    │ [GRAY]   │ [GRAY] │ [GRAY]   │ [GRAY]          │
├───────────┼──────────┼────────┼──────────┼─────────────────┤
│ Opening   │ -        │ 2      │ Video    │ Dynamic vis...  │
│ [WHITE]   │ [WHITE]  │ [WHITE]│ [WHITE]  │ [WHITE]         │
├───────────┼──────────┼────────┼──────────┼─────────────────┤
│ Welcome   │ -        │ 1      │ Static   │ Introduction... │
│ [LT GRAY] │ [LT GRAY]│[LT GRAY]│[LT GRAY]│ [LT GRAY]       │
├───────────┼──────────┼────────┼──────────┼─────────────────┤
│ Module 1  │          │ 30     │          │                 │
│ Total     │          │        │          │                 │
│ [LT GREEN BOLD] ⭐                                          │
└─────────────────────────────────────────────────────────────┘
```

## FILES MODIFIED

1. **Frontend Display:**
   - File: `public/stitch_welcome_/_login/personalized_learning_map/code.html`
   - Lines: ~500 changed/added
   - Libraries: Added ExcelJS + FileSaver.js

2. **Backend API:**
   - File: `Backend/api/generate-learning-map-ai.js`
   - Status: NO CHANGES NEEDED ✅
   - Already generates correct format

## HOW TO TEST

1. Navigate to: `http://localhost:8080/stitch_welcome_/_login/personalized_learning_map/code.html`
2. Open browser DevTools
3. Run in console:
```javascript
// Populate test data
window.setupTestData();
```
4. Refresh page
5. Click "Download Professional Excel"
6. Open Excel file
7. Verify colors match reference images

## DEPLOYMENT

```bash
# The updated file is ready at:
public/stitch_welcome_/_login/personalized_learning_map/code.html

# No backend changes needed
# No database changes needed
# Just deploy the updated HTML file
```

## SUPPORT

For issues, check:
1. Browser console for errors
2. ExcelJS library loaded: `window.ExcelJS`
3. Learning map data exists: `localStorage.getItem('generatedLearningMap')`
4. Backend running: `http://localhost:3000/api/health`

---

**Updated:** October 8, 2025
**Status:** Ready for deployment and testing
