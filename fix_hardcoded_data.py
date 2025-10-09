#!/usr/bin/env python3
"""
CourseCraft AI - Remove ALL Hardcoded/Fake Data for YC Funding
This script removes all fallback fake data and ensures only real AI results are displayed.
Target: Production-ready by November 10th
"""

import os
import re
from pathlib import Path

# Base directory
BASE_DIR = Path(r"C:\Users\Asus\Downloads\stitch_welcome___login_asraf_vercel\stitch_welcome___login (30)\stitch_welcome___login (25)\stitch_welcome___login (24)\stitch_welcome___login (2)\stitch_welcome___login (3)\public\stitch_welcome_\_login")

print("🚀 CourseCraft AI - Removing Hardcoded Data for YC Funding")
print("="*60)

# Track changes
changes_made = {}

def backup_file(filepath):
    """Create backup before modifying"""
    backup_path = str(filepath) + ".backup"
    if not os.path.exists(backup_path):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Backup created: {os.path.basename(backup_path)}")

def fix_strategy_recommendations():
    """Remove hardcoded strategy library from strategy_recommendations/code.html"""
    filepath = BASE_DIR / "strategy_recommendations" / "code.html"
    print(f"\n📝 Fixing: {filepath.name}")

    if not filepath.exists():
        print(f"⚠️  File not found: {filepath}")
        return

    backup_file(filepath)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_length = len(content)

    # Remove generateEnhancedContentSpecificStrategies function
    # Find the function and remove it entirely
    pattern1 = r'// Enhanced content-specific strategy generation fallback\s*\nfunction generateEnhancedContentSpecificStrategies\([^)]*\)\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}'

    if re.search(r'function generateEnhancedContentSpecificStrategies', content):
        # Find the start of the function
        start_marker = content.find('function generateEnhancedContentSpecificStrategies')
        if start_marker != -1:
            # Find the matching closing brace
            brace_count = 0
            in_function = False
            end_marker = start_marker

            for i in range(start_marker, len(content)):
                if content[i] == '{':
                    brace_count += 1
                    in_function = True
                elif content[i] == '}':
                    brace_count -= 1
                    if in_function and brace_count == 0:
                        end_marker = i + 1
                        break

            # Remove the function
            before = content[:start_marker]
            after = content[end_marker:]

            # Add error throwing replacement
            replacement = """
// REMOVED: generateEnhancedContentSpecificStrategies - using ONLY real AI
// If you see this, backend must be running for strategy generation
function generateEnhancedContentSpecificStrategies(contentDomain, smeAnswers) {
    console.error('❌ Strategy generation requires backend AI - no fallback data available');
    throw new Error('AI strategy generation required - backend must be running');
}
"""
            content = before + replacement + after
            print("  ✅ Removed hardcoded strategy library function")

    # Remove any hardcoded strategy arrays
    content = re.sub(
        r'const domainSpecificStrategies = \{[^}]*(?:\{[^}]*\}[^}]*)*\};',
        '// REMOVED: Hardcoded strategy templates - using real AI only',
        content,
        flags=re.DOTALL
    )

    # Fix the main strategy generation to throw error on API failure
    content = re.sub(
        r'return generateEnhancedContentSpecificStrategies\([^)]*\);',
        '''console.error('❌ Backend AI unavailable - cannot generate strategies');
        showBackendError('Strategy generation requires AI backend. Please ensure server is running.');
        return [];''',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    changes_made['strategy_recommendations'] = original_length - len(content)
    print(f"  📊 Removed {original_length - len(content)} characters of hardcoded data")

def fix_content_analysis_results():
    """Remove hardcoded quality scores from content_analysis_results/code.html"""
    filepath = BASE_DIR / "content_analysis_results" / "code.html"
    print(f"\n📝 Fixing: {filepath.name}")

    if not filepath.exists():
        print(f"⚠️  File not found: {filepath}")
        return

    backup_file(filepath)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_length = len(content)

    # Fix HTML hardcoded scores
    content = re.sub(r'<div id="clarity-bar" style="width: 92%"', '<div id="clarity-bar" style="width: 0%"', content)
    content = re.sub(r'<span id="clarity-score">92%</span>', '<span id="clarity-score">Loading...</span>', content)
    content = re.sub(r'<div id="redundancy-bar" style="width: 8%"', '<div id="redundancy-bar" style="width: 0%"', content)
    content = re.sub(r'<span id="redundancy-score">8%</span>', '<span id="redundancy-score">Loading...</span>', content)
    content = re.sub(r'<div id="engagement-bar" style="width: 78%"', '<div id="engagement-bar" style="width: 0%"', content)
    content = re.sub(r'<span id="engagement-score">78%</span>', '<span id="engagement-score">Loading...</span>', content)

    # Fix JavaScript default scores
    content = re.sub(
        r'let qualityMetrics = \{\s*clarity: 92,\s*redundancy: 8,\s*engagement: 78\s*\};',
        '''let qualityMetrics = {
    clarity: null,
    redundancy: null,
    engagement: null,
    loading: true
};''',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    changes_made['content_analysis_results'] = original_length - len(content)
    print(f"  ✅ Fixed hardcoded quality scores")
    print(f"  📊 Changed {abs(original_length - len(content))} characters")

def fix_personalized_learning_map():
    """Remove fallback generators from personalized_learning_map/code.html"""
    filepath = BASE_DIR / "personalized_learning_map" / "code.html"
    print(f"\n📝 Fixing: {filepath.name}")

    if not filepath.exists():
        print(f"⚠️  File not found: {filepath}")
        return

    backup_file(filepath)

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_length = len(content)

    # Remove generateContentSpecificLearningMap function
    if 'function generateContentSpecificLearningMap' in content:
        start_marker = content.find('function generateContentSpecificLearningMap')
        if start_marker != -1:
            brace_count = 0
            in_function = False
            end_marker = start_marker

            for i in range(start_marker, len(content)):
                if content[i] == '{':
                    brace_count += 1
                    in_function = True
                elif content[i] == '}':
                    brace_count -= 1
                    if in_function and brace_count == 0:
                        end_marker = i + 1
                        break

            before = content[:start_marker]
            after = content[end_marker:]

            replacement = """
// REMOVED: generateContentSpecificLearningMap - using ONLY real AI
function generateContentSpecificLearningMap() {
    console.error('❌ Learning map generation requires backend AI');
    throw new Error('AI learning map required - backend must be running');
}
"""
            content = before + replacement + after
            print("  ✅ Removed fake learning map generator")

    # Remove generateIntelligentModules if it exists
    if 'function generateIntelligentModules' in content:
        content = re.sub(
            r'function generateIntelligentModules\([^)]*\)\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}',
            '''// REMOVED: generateIntelligentModules - using real AI only
function generateIntelligentModules() {
    throw new Error('Backend AI required for module generation');
}''',
            content,
            flags=re.DOTALL
        )
        print("  ✅ Removed intelligent modules generator")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    changes_made['personalized_learning_map'] = original_length - len(content)
    print(f"  📊 Removed {original_length - len(content)} characters of fallback code")

def add_universal_error_handler():
    """Add universal error handling function to all workflow pages"""
    error_handler = """
<script>
// Universal Backend Error Handler for CourseCraft AI
function showBackendError(message) {
    console.error('🚨 Backend Error:', message);

    const errorDiv = document.createElement('div');
    errorDiv.id = 'backend-error-overlay';
    errorDiv.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';
    errorDiv.innerHTML = `
        <div class="bg-red-900 text-white p-8 rounded-lg max-w-2xl shadow-2xl">
            <h2 class="text-2xl font-bold mb-4">⚠️ AI Backend Unavailable</h2>
            <p class="mb-4 text-lg">${message}</p>
            <p class="text-sm opacity-80 mb-4">
                Please ensure the backend server is running at <code class="bg-red-800 px-2 py-1 rounded">http://localhost:3000</code>
            </p>
            <div class="flex gap-4">
                <button onclick="location.reload()" class="bg-white text-red-900 px-6 py-2 rounded font-bold hover:bg-gray-100">
                    🔄 Retry
                </button>
                <button onclick="document.getElementById('backend-error-overlay').remove()" class="bg-red-800 text-white px-6 py-2 rounded font-bold hover:bg-red-700">
                    Close
                </button>
            </div>
        </div>
    `;

    // Remove existing error overlay if present
    const existing = document.getElementById('backend-error-overlay');
    if (existing) existing.remove();

    document.body.appendChild(errorDiv);
}

// Backend connectivity check
async function checkBackendHealth() {
    try {
        const response = await fetch('http://localhost:3000/api/health', {
            method: 'GET',
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (response.ok) {
            console.log('✅ Backend AI connected');
            return true;
        } else {
            console.warn('⚠️ Backend returned status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        return false;
    }
}

// Check on page load
window.addEventListener('load', async () => {
    const isConnected = await checkBackendHealth();
    if (!isConnected) {
        console.warn('⚠️ Backend AI not available - features may be limited');
        // Show warning banner but don't block page
        const banner = document.createElement('div');
        banner.className = 'fixed top-0 left-0 right-0 bg-yellow-600 text-white px-4 py-2 text-center z-40';
        banner.innerHTML = '⚠️ AI Backend Not Connected - Please start backend server for full functionality';
        document.body.insertBefore(banner, document.body.firstChild);
    }
});
</script>
"""

    # Add to key workflow pages
    pages = [
        "content_upload_&_processing/code.html",
        "strategy_recommendations/code.html",
        "personalized_learning_map/code.html",
        "content_analysis_results/code.html"
    ]

    for page in pages:
        filepath = BASE_DIR / page
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Add error handler before closing </body> tag if not already present
            if 'showBackendError' not in content and '</body>' in content:
                content = content.replace('</body>', error_handler + '\n</body>')

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"  ✅ Added error handler to {page}")

def main():
    print("\n🔧 Starting Fixes...\n")

    try:
        fix_strategy_recommendations()
        fix_content_analysis_results()
        fix_personalized_learning_map()
        add_universal_error_handler()

        print("\n" + "="*60)
        print("✅ ALL FIXES COMPLETED!")
        print("="*60)
        print("\n📊 Summary of Changes:")
        for file, chars in changes_made.items():
            print(f"  • {file}: {abs(chars)} characters {'removed' if chars > 0 else 'added'}")

        print("\n🎯 Next Steps:")
        print("  1. Test content upload with real files")
        print("  2. Verify AI analysis displays (no fake data)")
        print("  3. Check strategy recommendations (real AI only)")
        print("  4. Test learning map generation")
        print("  5. Ensure backend errors show properly")

        print("\n🚀 Product Status: YC-Ready (Real AI Only)")
        print("   Deadline: November 10th")
        print("   Backend Required: ✅ YES - No fallbacks")

    except Exception as e:
        print(f"\n❌ Error during fixes: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
