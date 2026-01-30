import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use Gemini 2.5 Flash (fastest free model)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export interface ParsedCommand {
  action: string;
  entity: string;
  parameters: Record<string, any>;
  confidence: number;
}

export interface CommandResult {
  success: boolean;
  command?: ParsedCommand;
  error?: string;
  originalText?: string;
}

/**
 * Parse voice command using Gemini API
 */
export async function parseCommandWithGemini(text: string): Promise<CommandResult> {
  try {
    const prompt = `You are a voice command parser for a productivity app.
Parse this voice command and return ONLY a JSON object (no markdown, no explanation).

Voice command: "${text}"

Return JSON in this exact format:
{
  "action": "create_task" | "show_tasks" | "mark_task_done" | "delete_task" | "create_course" | "show_courses" | "create_reading" | "show_reading" | "create_goal" | "update_goal" | "show_goals" | "show_stats",
  "entity": "task" | "course" | "reading" | "goal",
  "parameters": {
    "title": "string (required for create/update/delete)",
    "deadline": "YYYY-MM-DD (parse natural dates like 'tomorrow', 'Feb 24')",
    "priority": "high" | "medium" | "low",
    "description": "string (optional)",
    "url": "string (for courses, YouTube URL)",
    "status": "todo" | "in_progress" | "done",
    "filter": "today" | "tomorrow" | "overdue" | "all",
    "progress": "number (0-100 for goals)",
    "category": "string (optional)"
  },
  "confidence": number (0-100, how confident you are)
}

Rules:
1. Parse natural dates: "tomorrow" → next day's date, "Feb 24" → 2025-02-24
2. Detect priority from keywords: "urgent", "important", "critical" → high
3. Extract title/name from command
4. If showing/listing, set filter appropriately
5. Return valid JSON only, no markdown formatting
6. Today's date is ${new Date().toISOString().split('T')[0]}

Examples:
"create task Review Report due tomorrow" → action: "create_task", title: "Review Report", deadline: tomorrow's date
"show tasks today" → action: "show_tasks", filter: "today"
"mark Review Report as done" → action: "mark_task_done", title: "Review Report"
"add course JavaScript from youtube.com/abc" → action: "create_course", title: "JavaScript", url: "youtube.com/abc"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Clean response (remove markdown code blocks if present)
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }

    // Parse JSON
    const parsed = JSON.parse(cleanText);

    return {
      success: true,
      command: parsed,
      originalText: text,
    };
  } catch (error) {
    console.error('[v0] Gemini API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate response message after command execution
 */
export async function generateResponseMessage(command: ParsedCommand, result: any): Promise<string> {
  try {
    const prompt = `Generate a short, friendly success message for this action:
Action: ${command.action}
Parameters: ${JSON.stringify(command.parameters)}
Result: ${result.success ? 'Success' : 'Failed'}

Return ONLY the message text, no JSON, no formatting.
Keep it under 20 words.
Use emojis where appropriate.

Examples:
- "✅ Task 'Review Report' created for tomorrow!"
- "📋 Found 5 tasks due today"
- "🎯 Goal updated to 75%"`;

    const genResult = await model.generateContent(prompt);
    const response = await genResult.response;
    return response.text().trim();
  } catch (error) {
    // Fallback to basic message
    return `Action completed: ${command.action}`;
  }
}
