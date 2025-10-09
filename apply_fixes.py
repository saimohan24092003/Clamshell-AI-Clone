#!/usr/bin/env python3
"""
Script to remove 2 fallback function calls from CourseCraft AI
"""
import os
import re

BASE_PATH = r"C:\Users\Asus\Downloads\stitch_welcome___login_asraf_vercel\stitch_welcome___login (30)\stitch_welcome___login (25)\stitch_welcome___login (24)\stitch_welcome___login (2)\stitch_welcome___login (3)"

# File paths - Direct paths (note: the folder name is stitch_welcome_ followed by _login, NOT /_login)
STRATEGY_FILE = r"C:\Users\Asus\Downloads\stitch_welcome___login_asraf_vercel\stitch_welcome___login (30)\stitch_welcome___login (25)\stitch_welcome___login (24)\stitch_welcome___login (2)\stitch_welcome___login (3)\public\stitch_welcome_\_login\strategy_recommendations\code.html"
LEARNING_MAP_FILE = r"C:\Users\Asus\Downloads\stitch_welcome___login_asraf_vercel\stitch_welcome___login (30)\stitch_welcome___login (25)\stitch_welcome___login (24)\stitch_welcome___login (2)\stitch_welcome___login (3)\public\stitch_welcome_\_login\personalized_learning_map\code.html"

# Debug paths
print(f"Strategy file path: {STRATEGY_FILE}")
print(f"Learning map file path: {LEARNING_MAP_FILE}")
print(f"Strategy file exists: {os.path.exists(STRATEGY_FILE)}")
print(f"Learning map file exists: {os.path.exists(LEARNING_MAP_FILE)}")

def apply_fix_1():
    """Fix #1: Remove fallback in strategy recommendations catch block"""
    print("Applying Fix #1: Strategy Recommendations...")

    with open(STRATEGY_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find and replace the catch block
    old_code = """    } catch (error) {
        console.error('❌ Strategy generation error:', error);
        console.log('🔄 Using enhanced fallback strategy system');
    }

    // Fallback to enhanced content-specific strategies
    return generateEnhancedContentSpecificStrategies(contentDomain, smeAnswers);
}"""

    new_code = """    } catch (error) {
        console.error('❌ Strategy generation failed - backend required:', error);

        // Show error to user - NO FALLBACK DATA
        if (typeof showBackendError === 'function') {
            showBackendError('Strategy generation requires AI backend connection. Please ensure the backend server is running at http://localhost:3000');
        }

        // Return empty array - NO FAKE DATA
        return [];
    }
}"""

    if old_code in content:
        new_content = content.replace(old_code, new_code, 1)
        with open(STRATEGY_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("✅ Fix #1 applied successfully!")
        return True
    else:
        print("❌ Fix #1: Pattern not found - code may already be modified")
        return False

def apply_fix_2():
    """Fix #2: Remove fallback learning map generation"""
    print("\nApplying Fix #2: Learning Map Generation...")

    with open(LEARNING_MAP_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find and replace the setTimeout fallback code
    old_code = """    setTimeout(() => {
        updateLearningMapStatus('Adding Strategy-Based Activities...', 'map-analyzing');

        setTimeout(() => {
            // Create intelligent learning map based on content analysis and strategies
            comprehensiveLearningMapData = generateContentSpecificLearningMap();
            displayIntelligentLearningMap();
        }, 1500);
    }, 1000);
}"""

    new_code = """    setTimeout(() => {
        console.error('❌ Learning map requires AI backend - no offline mode available');

        if (typeof showBackendError === 'function') {
            showBackendError('Learning map generation requires AI backend connection. Please ensure the backend server is running at http://localhost:3000');
        }

        comprehensiveLearningMapData = null;

        const container = document.getElementById('learning-map-container');
        if (container) {
            container.innerHTML = `
                <div style="padding: 40px; text-align: center; background: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; margin: 20px;">
                    <h2 style="color: #dc2626;">⚠️ AI Backend Required</h2>
                    <p style="margin: 20px 0;">Learning map generation requires the AI backend server.</p>
                    <p>Please ensure the backend is running at <code style="background: #fca5a5; padding: 2px 6px; border-radius: 4px;">http://localhost:3000</code></p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">
                        🔄 Retry Connection
                    </button>
                </div>
            `;
        }
    }, 1500);
}"""

    if old_code in content:
        new_content = content.replace(old_code, new_code, 1)
        with open(LEARNING_MAP_FILE, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("✅ Fix #2 applied successfully!")
        return True
    else:
        print("❌ Fix #2: Pattern not found - code may already be modified")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("CourseCraft AI - Remove Fallback Function Calls")
    print("=" * 60)

    fix1_success = apply_fix_1()
    fix2_success = apply_fix_2()

    print("\n" + "=" * 60)
    if fix1_success and fix2_success:
        print("✅ All fixes applied successfully!")
    elif fix1_success or fix2_success:
        print("⚠️  Some fixes applied - check output above")
    else:
        print("❌ No fixes applied - check if code is already modified")
    print("=" * 60)
