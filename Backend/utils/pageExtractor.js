import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract content with page number tracking from uploaded files
 * @param {string} filePath - Path to the uploaded file
 * @param {string} fileName - Original file name
 * @returns {Promise<{text: string, totalPages: number, pageMapping: Array, fileName: string}>}
 */
export async function extractContentWithPages(filePath, fileName) {
    const ext = path.extname(fileName).toLowerCase();

    try {
        if (ext === '.pdf') {
            return await extractPDFWithPages(filePath, fileName);
        } else if (ext === '.docx') {
            return await extractDOCXWithPages(filePath, fileName);
        } else if (ext === '.txt') {
            return await extractTXTWithPages(filePath, fileName);
        } else {
            // Fallback: try to read as text
            const content = await fs.readFile(filePath, 'utf-8');
            return {
                text: content,
                totalPages: 1,
                pageMapping: [{ page: 1, content: content, startChar: 0, endChar: content.length }],
                fileName: fileName
            };
        }
    } catch (error) {
        console.error('Page extraction error:', error);
        // Return empty structure on error
        return {
            text: '',
            totalPages: 0,
            pageMapping: [],
            fileName: fileName,
            error: error.message
        };
    }
}

/**
 * Extract PDF with page-by-page tracking
 * @param {string} filePath - Path to PDF file
 * @param {string} fileName - Original file name
 * @returns {Promise<{text: string, totalPages: number, pageMapping: Array, fileName: string}>}
 */
async function extractPDFWithPages(filePath, fileName) {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);

    // pdf-parse doesn't provide page-by-page content directly
    // We'll estimate page breaks based on content length
    const totalPages = pdfData.numpages;
    const fullText = pdfData.text;
    const avgCharsPerPage = Math.ceil(fullText.length / totalPages);

    const pageMapping = [];
    let currentPos = 0;

    for (let i = 1; i <= totalPages; i++) {
        const startChar = currentPos;
        const endChar = Math.min(currentPos + avgCharsPerPage, fullText.length);
        const pageContent = fullText.substring(startChar, endChar);

        pageMapping.push({
            page: i,
            content: pageContent,
            startChar: startChar,
            endChar: endChar,
            charCount: pageContent.length
        });

        currentPos = endChar;
    }

    console.log(`✅ PDF extracted: ${totalPages} pages, ${fullText.length} characters`);

    return {
        text: fullText,
        totalPages: totalPages,
        pageMapping: pageMapping,
        fileName: fileName,
        metadata: {
            info: pdfData.info,
            metadata: pdfData.metadata
        }
    };
}

/**
 * Extract DOCX with section-based page estimation
 * @param {string} filePath - Path to DOCX file
 * @param {string} fileName - Original file name
 * @returns {Promise<{text: string, totalPages: number, pageMapping: Array, fileName: string}>}
 */
async function extractDOCXWithPages(filePath, fileName) {
    const result = await mammoth.extractRawText({ path: filePath });
    const fullText = result.value;

    // DOCX doesn't have explicit page numbers
    // Estimate based on character count (approximately 3000 chars per page)
    const charsPerPage = 3000;
    const estimatedPages = Math.ceil(fullText.length / charsPerPage);

    const pageMapping = [];

    for (let i = 1; i <= estimatedPages; i++) {
        const startChar = (i - 1) * charsPerPage;
        const endChar = Math.min(i * charsPerPage, fullText.length);
        const pageContent = fullText.substring(startChar, endChar);

        pageMapping.push({
            page: i,
            content: pageContent,
            startChar: startChar,
            endChar: endChar,
            charCount: pageContent.length,
            estimated: true
        });
    }

    console.log(`✅ DOCX extracted: ~${estimatedPages} estimated pages, ${fullText.length} characters`);

    return {
        text: fullText,
        totalPages: estimatedPages,
        pageMapping: pageMapping,
        fileName: fileName,
        isEstimated: true,
        warnings: result.messages || []
    };
}

/**
 * Extract TXT with line-based page estimation
 * @param {string} filePath - Path to TXT file
 * @param {string} fileName - Original file name
 * @returns {Promise<{text: string, totalPages: number, pageMapping: Array, fileName: string}>}
 */
async function extractTXTWithPages(filePath, fileName) {
    const content = await fs.readFile(filePath, 'utf-8');

    // For TXT files, estimate pages based on character count
    const charsPerPage = 3000;
    const estimatedPages = Math.ceil(content.length / charsPerPage);

    const pageMapping = [];

    for (let i = 1; i <= estimatedPages; i++) {
        const startChar = (i - 1) * charsPerPage;
        const endChar = Math.min(i * charsPerPage, content.length);
        const pageContent = content.substring(startChar, endChar);

        pageMapping.push({
            page: i,
            content: pageContent,
            startChar: startChar,
            endChar: endChar,
            charCount: pageContent.length,
            estimated: true
        });
    }

    console.log(`✅ TXT extracted: ~${estimatedPages} estimated pages, ${content.length} characters`);

    return {
        text: content,
        totalPages: estimatedPages,
        pageMapping: pageMapping,
        fileName: fileName,
        isEstimated: true
    };
}

/**
 * Find which page(s) contain a specific text snippet
 * @param {Array} pageMapping - Page mapping array from extraction
 * @param {string} searchText - Text to search for
 * @returns {Array<number>} - Array of page numbers containing the text
 */
export function findPagesContaining(pageMapping, searchText) {
    const pages = [];
    const searchLower = searchText.toLowerCase();

    pageMapping.forEach(page => {
        if (page.content.toLowerCase().includes(searchLower)) {
            pages.push(page.page);
        }
    });

    return pages;
}

/**
 * Get page range string for display (e.g., "Page 5", "Pages 5-8")
 * @param {Array<number>} pages - Array of page numbers
 * @returns {string} - Formatted page range string
 */
export function formatPageRange(pages) {
    if (!pages || pages.length === 0) {
        return '-';
    }

    if (pages.length === 1) {
        return `Page ${pages[0]}`;
    }

    // Find consecutive page ranges
    const sorted = [...new Set(pages)].sort((a, b) => a - b);
    const ranges = [];
    let rangeStart = sorted[0];
    let rangeEnd = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === rangeEnd + 1) {
            rangeEnd = sorted[i];
        } else {
            ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
            rangeStart = sorted[i];
            rangeEnd = sorted[i];
        }
    }

    ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);

    return `Pages ${ranges.join(', ')}`;
}

/**
 * Get content from specific page(s)
 * @param {Array} pageMapping - Page mapping array from extraction
 * @param {number|Array<number>} pages - Page number or array of page numbers
 * @returns {string} - Content from specified page(s)
 */
export function getContentFromPages(pageMapping, pages) {
    const pageNumbers = Array.isArray(pages) ? pages : [pages];
    const content = pageNumbers
        .map(pageNum => {
            const page = pageMapping.find(p => p.page === pageNum);
            return page ? page.content : '';
        })
        .filter(c => c.length > 0)
        .join('\n\n');

    return content;
}
