import {
  UploadSession,
  ProfessionalAnalysis,
  SMEQuestions,
  SMEResponses,
  LearningMap,
  StrategyRecommendations,
  UserFeedback,
  ContentSuggestions,
  PageComments
} from '../models/index.js';

export class DataService {
  // Upload Session Operations
  async createUploadSession(sessionData) {
    try {
      const session = new UploadSession(sessionData);
      return await session.save();
    } catch (error) {
      console.error('Error creating upload session:', error);
      throw error;
    }
  }

  async getUploadSession(sessionId) {
    try {
      return await UploadSession.findOne({ sessionId });
    } catch (error) {
      console.error('Error getting upload session:', error);
      throw error;
    }
  }

  async updateUploadSession(sessionId, updateData) {
    try {
      return await UploadSession.findOneAndUpdate(
        { sessionId },
        updateData,
        { new: true, upsert: false }
      );
    } catch (error) {
      console.error('Error updating upload session:', error);
      throw error;
    }
  }

  async getAllUploadSessions(limit = 50, skip = 0) {
    try {
      return await UploadSession.find()
        .sort({ uploadedAt: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      console.error('Error getting all upload sessions:', error);
      throw error;
    }
  }

  // Professional Analysis Operations
  async saveProfessionalAnalysis(analysisData) {
    try {
      const analysis = new ProfessionalAnalysis(analysisData);
      return await analysis.save();
    } catch (error) {
      console.error('Error saving professional analysis:', error);
      throw error;
    }
  }

  async getProfessionalAnalysis(sessionId) {
    try {
      return await ProfessionalAnalysis.findOne({ sessionId });
    } catch (error) {
      console.error('Error getting professional analysis:', error);
      throw error;
    }
  }

  async updateProfessionalAnalysis(sessionId, updateData) {
    try {
      return await ProfessionalAnalysis.findOneAndUpdate(
        { sessionId },
        updateData,
        { new: true, upsert: true }
      );
    } catch (error) {
      console.error('Error updating professional analysis:', error);
      throw error;
    }
  }

  // Alias methods for strategy generation
  async getContentAnalysis(sessionId) {
    return this.getProfessionalAnalysis(sessionId);
  }

  async getSmeResponses(sessionId) {
    return this.getSMEResponses(sessionId);
  }

  // SME Questions Operations
  async saveSMEQuestions(questionsData) {
    try {
      const questions = new SMEQuestions(questionsData);
      return await questions.save();
    } catch (error) {
      console.error('Error saving SME questions:', error);
      throw error;
    }
  }

  async getSMEQuestions(sessionId) {
    try {
      return await SMEQuestions.findOne({ sessionId });
    } catch (error) {
      console.error('Error getting SME questions:', error);
      throw error;
    }
  }

  // SME Responses Operations
  async saveSMEResponses(responsesData) {
    try {
      const responses = new SMEResponses(responsesData);
      return await responses.save();
    } catch (error) {
      console.error('Error saving SME responses:', error);
      throw error;
    }
  }

  async getSMEResponses(sessionId) {
    try {
      return await SMEResponses.findOne({ sessionId });
    } catch (error) {
      console.error('Error getting SME responses:', error);
      throw error;
    }
  }

  async updateSMEResponses(sessionId, responsesData) {
    try {
      return await SMEResponses.findOneAndUpdate(
        { sessionId },
        responsesData,
        { new: true, upsert: true }
      );
    } catch (error) {
      console.error('Error updating SME responses:', error);
      throw error;
    }
  }

  // Learning Map Operations
  async saveLearningMap(learningMapData) {
    try {
      const learningMap = new LearningMap(learningMapData);
      return await learningMap.save();
    } catch (error) {
      console.error('Error saving learning map:', error);
      throw error;
    }
  }

  async getLearningMap(sessionId) {
    try {
      return await LearningMap.findOne({ sessionId });
    } catch (error) {
      console.error('Error getting learning map:', error);
      throw error;
    }
  }

  async updateLearningMap(sessionId, learningMapData) {
    try {
      return await LearningMap.findOneAndUpdate(
        { sessionId },
        learningMapData,
        { new: true, upsert: true }
      );
    } catch (error) {
      console.error('Error updating learning map:', error);
      throw error;
    }
  }

  // Strategy Recommendations Operations
  async saveStrategyRecommendations(strategyData) {
    try {
      // Clean the strategy data to ensure no circular references or complex objects
      const cleanStrategyData = {
        ...strategyData,
        strategies: strategyData.strategies.map(strategy => ({
          ...strategy,
          // Completely rebuild idealFor array to eliminate any circular references
          idealFor: (() => {
            if (!strategy.idealFor) return ['General purpose'];

            if (Array.isArray(strategy.idealFor)) {
              // Convert each item to a clean string and rebuild the array
              const cleanItems = [];
              for (let i = 0; i < strategy.idealFor.length; i++) {
                const item = strategy.idealFor[i];
                const cleanItem = (item || '').toString().trim();
                if (cleanItem && cleanItem !== 'undefined' && cleanItem !== 'null') {
                  cleanItems.push(cleanItem);
                }
              }
              return cleanItems.length > 0 ? cleanItems : ['General purpose'];
            }

            // Handle non-array case
            const cleanItem = strategy.idealFor.toString().trim();
            return cleanItem ? [cleanItem] : ['General purpose'];
          })()
        }))
      };

      const strategy = new StrategyRecommendations(cleanStrategyData);
      return await strategy.save();
    } catch (error) {
      console.error('Error saving strategy recommendations:', error);
      throw error;
    }
  }

  async getStrategyRecommendations(sessionId) {
    try {
      return await StrategyRecommendations.findOne({ sessionId });
    } catch (error) {
      console.error('Error getting strategy recommendations:', error);
      throw error;
    }
  }

  // Content Suggestions Operations
  async saveContentSuggestions(suggestionsData) {
    try {
      const suggestions = new ContentSuggestions(suggestionsData);
      return await suggestions.save();
    } catch (error) {
      console.error('Error saving content suggestions:', error);
      throw error;
    }
  }

  async getContentSuggestions(sessionId) {
    try {
      return await ContentSuggestions.findOne({ sessionId });
    } catch (error) {
      console.error('Error getting content suggestions:', error);
      throw error;
    }
  }

  async updateContentSuggestions(sessionId, suggestionsData) {
    try {
      return await ContentSuggestions.findOneAndUpdate(
        { sessionId },
        suggestionsData,
        { new: true, upsert: true }
      );
    } catch (error) {
      console.error('Error updating content suggestions:', error);
      throw error;
    }
  }

  // User Feedback Operations
  async saveUserFeedback(feedbackData) {
    try {
      const feedback = new UserFeedback(feedbackData);
      return await feedback.save();
    } catch (error) {
      console.error('Error saving user feedback:', error);
      throw error;
    }
  }

  async getUserFeedback(sessionId) {
    try {
      return await UserFeedback.find({ sessionId });
    } catch (error) {
      console.error('Error getting user feedback:', error);
      throw error;
    }
  }

  // Complete Session Data Operations
  async getCompleteSessionData(sessionId) {
    try {
      const [
        uploadSession,
        professionalAnalysis,
        smeQuestions,
        smeResponses,
        learningMap,
        strategyRecommendations,
        contentSuggestions,
        userFeedback
      ] = await Promise.all([
        this.getUploadSession(sessionId),
        this.getProfessionalAnalysis(sessionId),
        this.getSMEQuestions(sessionId),
        this.getSMEResponses(sessionId),
        this.getLearningMap(sessionId),
        this.getStrategyRecommendations(sessionId),
        this.getContentSuggestions(sessionId),
        this.getUserFeedback(sessionId)
      ]);

      return {
        uploadSession,
        professionalAnalysis,
        smeQuestions,
        smeResponses,
        learningMap,
        strategyRecommendations,
        contentSuggestions,
        userFeedback
      };
    } catch (error) {
      console.error('Error getting complete session data:', error);
      throw error;
    }
  }

  // Data Migration from Memory to Database
  async migrateMemorySession(sessionId, memorySessionData) {
    try {
      console.log(`🔄 Migrating session ${sessionId} from memory to database...`);

      // Save upload session
      if (memorySessionData.sessionId) {
        await this.createUploadSession({
          sessionId: memorySessionData.sessionId,
          uploadedAt: new Date(memorySessionData.uploadedAt),
          status: memorySessionData.status,
          analysisProgress: memorySessionData.analysisProgress,
          currentStep: memorySessionData.currentStep,
          completedAt: memorySessionData.completedAt ? new Date(memorySessionData.completedAt) : null,
          errorMessage: memorySessionData.errorMessage,
          files: memorySessionData.files || [],
          contentData: memorySessionData.contentData || [],
          analysisResults: memorySessionData.analysisResults || null
        });
      }

      // Save professional analysis
      if (memorySessionData.professionalAnalysis) {
        await this.saveProfessionalAnalysis({
          sessionId,
          ...memorySessionData.professionalAnalysis
        });
      }

      // Save SME questions
      if (memorySessionData.contentSpecificSMEQuestions) {
        await this.saveSMEQuestions({
          sessionId,
          questions: memorySessionData.contentSpecificSMEQuestions,
          totalQuestions: memorySessionData.contentSpecificSMEQuestions.length,
          domain: memorySessionData.professionalAnalysis?.domainClassification?.primaryDomain,
          complexity: memorySessionData.professionalAnalysis?.complexityAssessment?.level
        });
      }

      // Save SME responses
      if (memorySessionData.smeResponses) {
        await this.saveSMEResponses({
          sessionId,
          answers: memorySessionData.smeResponses.answers || [],
          completedAt: memorySessionData.smeResponses.completedAt ? new Date(memorySessionData.smeResponses.completedAt) : null,
          totalQuestions: memorySessionData.smeResponses.totalQuestions,
          answeredQuestions: memorySessionData.smeResponses.answeredQuestions,
          completionRate: memorySessionData.smeResponses.completionRate
        });
      }

      // Save learning map
      if (memorySessionData.learningMap) {
        await this.saveLearningMap({
          sessionId,
          ...memorySessionData.learningMap,
          generatedAt: memorySessionData.learningMapGeneratedAt ? new Date(memorySessionData.learningMapGeneratedAt) : new Date()
        });
      }

      // Save content suggestions
      if (memorySessionData.approvedSuggestions) {
        await this.saveContentSuggestions({
          sessionId,
          approvedSuggestions: memorySessionData.approvedSuggestions.suggestions || [],
          userNotes: memorySessionData.approvedSuggestions.userNotes,
          approvedAt: memorySessionData.approvedSuggestions.approvedAt ? new Date(memorySessionData.approvedSuggestions.approvedAt) : null,
          approvedBy: memorySessionData.approvedSuggestions.approvedBy
        });
      }

      console.log(`✅ Successfully migrated session ${sessionId} to database`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to migrate session ${sessionId}:`, error);
      throw error;
    }
  }

  // Analytics and Statistics
  async getAnalytics() {
    try {
      const [
        totalSessions,
        completedSessions,
        analysisCount,
        learningMapsCount,
        feedbackCount
      ] = await Promise.all([
        UploadSession.countDocuments(),
        UploadSession.countDocuments({ status: 'completed' }),
        ProfessionalAnalysis.countDocuments(),
        LearningMap.countDocuments(),
        UserFeedback.countDocuments()
      ]);

      return {
        totalSessions,
        completedSessions,
        analysisCount,
        learningMapsCount,
        feedbackCount,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  // Search Operations
  async searchSessions(query, limit = 20) {
    try {
      return await UploadSession.find({
        $or: [
          { 'files.originalName': { $regex: query, $options: 'i' } },
          { 'analysisResults.domainClassified': { $regex: query, $options: 'i' } },
          { sessionId: { $regex: query, $options: 'i' } }
        ]
      }).limit(limit).sort({ uploadedAt: -1 });
    } catch (error) {
      console.error('Error searching sessions:', error);
      throw error;
    }
  }

  // Page Comments Operations - Expert Feedback System
  async getPageComments(sessionId, pageId) {
    try {
      const pageComments = await PageComments.findOne({ sessionId, pageId });
      return pageComments?.comments || [];
    } catch (error) {
      console.error('Error getting page comments:', error);
      throw error;
    }
  }

  async addPageComment(sessionId, pageId, commentData) {
    try {
      const newComment = {
        id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
        content: commentData.content,
        expertName: commentData.expertName || 'Expert',
        expertEmail: commentData.expertEmail || 'expert@company.com',
        timestamp: new Date(),
        isResolved: false,
        priority: commentData.priority || 'medium',
        category: commentData.category || 'feedback'
      };

      const result = await PageComments.findOneAndUpdate(
        { sessionId, pageId },
        {
          $push: { comments: newComment },
          $inc: { totalComments: 1 },
          $set: { lastCommentAt: new Date() }
        },
        { upsert: true, new: true }
      );

      console.log(`💬 Comment added to ${pageId} for session ${sessionId}`);
      return newComment;
    } catch (error) {
      console.error('Error adding page comment:', error);
      throw error;
    }
  }

  async deletePageComment(sessionId, pageId, commentId, isAdmin = false) {
    try {
      if (!isAdmin) {
        throw new Error('Only administrators can delete comments');
      }

      const result = await PageComments.findOneAndUpdate(
        { sessionId, pageId },
        {
          $pull: { comments: { id: commentId } },
          $inc: { totalComments: -1 }
        },
        { new: true }
      );

      console.log(`🗑️ Admin deleted comment ${commentId} from ${pageId}`);
      return result;
    } catch (error) {
      console.error('Error deleting page comment:', error);
      throw error;
    }
  }

  async updateCommentStatus(sessionId, pageId, commentId, isResolved) {
    try {
      const result = await PageComments.findOneAndUpdate(
        { sessionId, pageId, 'comments.id': commentId },
        { $set: { 'comments.$.isResolved': isResolved } },
        { new: true }
      );

      console.log(`✅ Comment ${commentId} marked as ${isResolved ? 'resolved' : 'unresolved'}`);
      return result;
    } catch (error) {
      console.error('Error updating comment status:', error);
      throw error;
    }
  }

  async getAllCommentsForSession(sessionId) {
    try {
      const allPageComments = await PageComments.find({ sessionId });
      const commentsMap = {};

      allPageComments.forEach(pageComment => {
        commentsMap[pageComment.pageId] = {
          comments: pageComment.comments,
          totalComments: pageComment.totalComments,
          lastCommentAt: pageComment.lastCommentAt
        };
      });

      return commentsMap;
    } catch (error) {
      console.error('Error getting all session comments:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;