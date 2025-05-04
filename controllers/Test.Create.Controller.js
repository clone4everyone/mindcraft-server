const { GoogleGenerativeAI } = require("@google/generative-ai");
const TestModel = require("../models/TestModel");
const UserModel = require("../models/UserModel");
const TestModuleModel= require("../models/TestModule");
// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GoogleGenerativeAI_API_KEY); 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generate test based on user prompt
 * @param {Object} req - Request object with prompt and test time
 * @param {Object} res - Response object
 */
exports.GeminiCreate = async (req, res) => {
    try {
        const { prompt, durationSeconds } = req.body;
        // const clerkId = req.user.id; // Assuming user ID comes from auth middleware
        // const clerkId = '6811b868586f70dfeee95fee';
        const clerkId=req.body.clerkId;
        console.log(clerkId)
        // Validate prompt
        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide a valid prompt for test generation" 
            });
        }

        // Check if user is premium
        // const user = await UserModel.findById(clerkId);
        // const isPremium = user?.premium || false;
        const isPremium=false;
        // Generate test content using Gemini
        const result = await generateTestFromPrompt(prompt, isPremium);
        
        if (result.success) {
            // Save questions to database
            const savedQuestions = await saveQuestionsToDb(result.questions, clerkId,prompt,durationSeconds);
            
            return res.status(200).json({
                success: true,
                message: !isPremium && result.limitApplied ? 
                          "Test generated with 30 questions (upgrade to premium for more)" : 
                          "Test generated successfully",
                test: savedQuestions,
                durationSeonds: durationSeconds || 30, // Default test time 30 minutes if not specified
                limitApplied: result.limitApplied
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.message || "Failed to generate test. Please refine your prompt."
            });
        }
        
    } catch (error) {
        console.error("Error generating test:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while generating the test"
        });
    }
};

/**
 * Generate test content using Gemini AI based on user prompt
 * @param {string} prompt - User's prompt for test generation
 * @param {boolean} isPremium - Whether the user has premium access
 * @returns {Object} Generated test questions or error message
 */
async function generateTestFromPrompt(prompt, isPremium) {
    // Construct a prompt for Gemini
    const geminiPrompt = `
Generate a test based on the following prompt: "${prompt}"

Instructions:
- Create multiple-choice questions based on the content of the prompt
- If the prompt mentions a specific number of questions, use that number
- If no question count is specified, generate 10 questions
- If the prompt specifies a difficulty level (easy, medium, hard), use that level
- If no difficulty level is specified, use a mix of difficulty levels
- If the prompt specifies a number of options per question, use that number (maximum 5)
- If no option count is specified, use 4 options per question
${!isPremium ? '- Generate a maximum of 30 questions even if more are requested (non-premium user restriction)' : ''}

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text goes here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "A",
    "level": "medium",
    "previousUsage": "Google interview 2023" (or null if not known)
  },
  ...more questions...
]

If the prompt is not suitable for test generation, respond with: 
{"error": "Please provide a more specific prompt for test generation."}
`;

    try {
        const result = await model.generateContent(geminiPrompt);
        const responseText = result.response.text();
        
        // Check if response indicates the prompt is not suitable
        if (responseText.includes('"error"')) {
            try {
                const errorObj = JSON.parse(responseText);
                return {
                    success: false,
                    message: errorObj.error
                };
            } catch (e) {
                return {
                    success: false,
                    message: "Unable to generate test from your prompt. Please provide more specific information."
                };
            }
        }
        
        // Extract JSON from the response
        let jsonStr = responseText;
        
        // Look for JSON array start and end
        const startIdx = responseText.indexOf('[');
        const endIdx = responseText.lastIndexOf(']') + 1;
        
        if (startIdx >= 0 && endIdx > startIdx) {
            jsonStr = responseText.substring(startIdx, endIdx);
        }
        
        // Parse the JSON
        let questions;
        try {
            questions = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse JSON from Gemini response:", e);
            return {
                success: false,
                message: "Failed to parse generated test questions. Please try a different prompt."
            };
        }
        
        // Validate the structure of questions
        if (!Array.isArray(questions)) {
            return {
                success: false,
                message: "Failed to generate proper test questions"
            };
        }
        
        // Apply non-premium user question limit
        let limitApplied = false;
        if (!isPremium && questions.length > 30) {
            questions = questions.slice(0, 30);
            limitApplied = true;
        }
        
        return {
            success: true,
            questions: questions,
            limitApplied: limitApplied
        };
        
    } catch (error) {
        console.error("Error with AI generation:", error);
        return {
            success: false,
            message: "Error processing your prompt. Please try with a different prompt."
        };
    }
}

/**
 * Save generated questions to database
 * @param {Array} questions - Array of question objects to save
 * @param {string} clerkId - User ID to associate with questions
 * @returns {Array} Array of saved question objects
 */
async function saveQuestionsToDb(questions, clerkId,prompt,durationSeconds) {
    const savedQuestions = [];
    const module=await TestModuleModel.create({clerkId:clerkId,moduleName:prompt.substring(0,10),durationSeconds});
    for (const q of questions) {
        // Validate question format
        if (!q.question || !Array.isArray(q.options) || !q.answer) {
            continue; // Skip invalid questions
        }
        
        const newQuestion = new TestModel({
            question: q.question,
            options: q.options,
            level: q.level || "medium", // Default to medium if not specified
            answer: q.answer,
            previousUsage: q.previousUsage || null,
             clerkId
        });
        
        const savedQuestion = await newQuestion.save();
        await TestModuleModel.findOneAndUpdate({_id:module._id},{ $push: { moduleData: savedQuestion._id } },{new:true})
        
        savedQuestions.push(savedQuestion);
    }
    
    return savedQuestions;
}

/**
 * Get all tests for a user
 */
exports.getUserTests = async (req, res) => {
    try {
        const {clerkId} = req.body;
        const tests = await TestModuleModel.find({ clerkId: clerkId }).populate('moduleData');
        
        return res.status(200).json({
            success: true,
            tests
        });
    } catch (error) {
        console.error("Error fetching tests:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tests"
        });
    }
};

/**
 * Delete a test
 */
exports.deleteTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const clerkId = req.user.id;
        
        // Check if test exists and belongs to user
        const test = await TestModel.findOne({
            _id: testId,
            user: clerkId
        });
        
        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found or access denied"
            });
        }
        
        await TestModel.findByIdAndDelete(testId);
        
        return res.status(200).json({
            success: true,
            message: "Test deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting test:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete test"
        });
    }
};

/**
 * Get a specific test by ID
 */
exports.getTestById = async (req, res) => {
    try {
        const { testId } = req.body;
        
        const test = await TestModuleModel.findOne({
            _id: testId,
        }).populate('moduleData');
        
        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found or access denied"
            });
        }
        
        return res.status(200).json({
            success: true,
            test
        });
    } catch (error) {
        console.error("Error fetching test:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test"
        });
    }
};