import { Attachment } from '../types';
import { fetchURLContent } from './urlContentService';

export interface ExtractionResult {
  text: string;
  success: boolean;
  error?: string;
}

interface NormalizeResult {
  combinedText: string;
  failedExtractions: string[];
}

/**
 * Prepares text for summarization by processing attachments and user input
 * This function handles all attachment types client-side without backend dependency
 */
export const prepareTextForSummarization = async (
  userText: string,
  attachments: Attachment[]
): Promise<NormalizeResult | null> => {
  // If no context at all
  if (!userText && attachments.length === 0) return null;

  const textParts: string[] = [];
  const failedExtractions: string[] = [];

  // Add user-typed text first
  if (userText && userText.trim()) {
    textParts.push(userText.trim());
  }

  // Process each attachment
  for (const attachment of attachments) {
    try {
      switch (attachment.type) {
        case 'url': {
          console.log('Fetching URL content:', attachment.content);
          const result = await fetchURLContent(attachment.content);

          if (result.success && result.text) {
            const header = result.title
              ? `\n\n--- Content from: ${result.title} ---\n\n`
              : `\n\n--- Content from URL ---\n\n`;
            textParts.push(header + result.text);
          } else {
            const errorMsg = `URL: ${attachment.name || attachment.content} - ${result.error || 'Failed to extract content'}`;
            failedExtractions.push(errorMsg);
            console.warn('URL extraction failed:', errorMsg);
          }
          break;
        }

        case 'pdf': {
          // For PDFs, we'll rely on the Gemini multimodal API to handle them
          // The PDF content is already base64 encoded in attachment.content
          // We'll pass a marker that this is a PDF attachment
          textParts.push(`\n\n--- PDF Document: ${attachment.name || 'Document'} ---\n[PDF content will be processed by AI]\n`);
          // Note: The actual PDF processing happens in geminiService via multimodal API
          break;
        }

        case 'audio': {
          // Similar to PDF, audio transcription should be handled by Gemini's multimodal capabilities
          textParts.push(`\n\n--- Audio Recording: ${attachment.name || 'Voice Note'} ---\n[Audio content will be transcribed by AI]\n`);
          // Note: The actual audio processing happens in geminiService via multimodal API
          break;
        }

        case 'image': {
          // Images should be handled by Gemini's vision capabilities
          textParts.push(`\n\n--- Image: ${attachment.name || 'Image'} ---\n[Image content will be analyzed by AI]\n`);
          // Note: The actual image processing happens in geminiService via multimodal API
          break;
        }

        default:
          failedExtractions.push(`Unknown attachment type: ${attachment.type}`);
      }
    } catch (error: any) {
      const errorMsg = `${attachment.name || attachment.type}: ${error.message || 'Processing failed'}`;
      failedExtractions.push(errorMsg);
      console.error('Attachment processing error:', error);
    }
  }

  // If no content was successfully extracted at all
  if (textParts.length === 0) {
    return {
      combinedText: '',
      failedExtractions: failedExtractions.length > 0
        ? failedExtractions
        : ['No content could be extracted from the provided inputs']
    };
  }

  const combinedText = textParts.join('\n');

  return {
    combinedText,
    failedExtractions
  };
};

// Legacy function - kept for backward compatibility but redirects to new implementation
export const extractYouTubeTranscript = async (url: string): Promise<ExtractionResult> => {
  const result = await fetchURLContent(url);
  return {
    text: result.text,
    success: result.success,
    error: result.error
  };
};

// Legacy function - kept for backward compatibility but redirects to new implementation
export const extractWebsiteContent = async (url: string): Promise<ExtractionResult> => {
  const result = await fetchURLContent(url);
  return {
    text: result.text,
    success: result.success,
    error: result.error
  };
};
