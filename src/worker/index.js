import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable Cross Origin Resource Sharing (CORS)
// In development: allows localhost
// In production: only allows your deployed domain
app.use('/*', cors({
  origin: (origin) => {
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    // Allow your production domain
    if (origin === 'https://2-truths-and-ai.riloda897.workers.dev' /*|| origin === 'https://yourdomain.com'*/) {
      return origin;
    }
    // Reject all others
    return null;
  },
  credentials: true,
}));

/**
 * Backend API endpoint to generate AI lies based on player truths
 */
app.post('/api/generate-lies', async (c) => {
    try {
        const body = await c.req.json();
        
        // Format input according to system prompt:
        // "User 1" followed by their truths (2 lines per truth set), then "User 2", etc.
        const formattedInput = [];
        
        for (let i = 0; i < body.players.length; i++) {
            const player = body.players[i];
            formattedInput.push(`User ${i + 1}`);
            
            // Add all truths for this player (already flattened array from frontend)
            for (let truth of player.truths) {
                formattedInput.push(sanitizeTruth(truth));
            }
        }
        
        console.log("Formatted input for lie generation:", formattedInput);

        // Check that ai model is provided and valid, else use default
        const validAiModels = ['gpt-5-nano', 'gpt-4.1-mini', 'gpt-35-turbo'];
        const aiModel = validAiModels.includes(body.aiModel) ? body.aiModel : 'gpt-5-nano';

        // Call OpenAI API with formatted input and generate lies
        let liesArray;
        try {
            liesArray = await generateLiesFromTruths(formattedInput, aiModel, c.env);
        } catch (error) {
            console.error("Error generating lies from truths:", error);
            return c.json({ error: "Error generating lies" }, 500);
        }
        
        // Map lies back to player IDs
        // Each player should get one lie per truth set (each set = 2 truths)
        const lies = {};
        let lieIndex = 0;
        
        for (let player of body.players) {
            const numTruthSets = Math.floor(player.truths.length / 2);
            const playerLies = liesArray.slice(lieIndex, lieIndex + numTruthSets);
            lies[player.id] = playerLies;
            
            console.log(`Player ${player.id} (${player.name}): ${player.truths.length} truths → ${numTruthSets} sets → expecting ${numTruthSets} lies, got ${playerLies.length}`);
            
            lieIndex += numTruthSets;
        }
        
        console.log("Generated lies mapped to players:", lies);
        
        // Validate we used all lies
        if (lieIndex !== liesArray.length) {
            console.warn(`Warning: Expected ${lieIndex} lies but got ${liesArray.length} from AI`);
        }

        return c.json({ lies: lies });
    } catch (error) {
        console.error("Error processing request:", error);
        return c.json({ error: "Invalid request" }, 400);
    }
});

// Fallback: serve static assets
app.get('*', (c) => {
    return c.env.ASSETS.fetch(c.req.raw);
});

export default app;

/**
 * Sanitize a user truth to prevent injection attacks
 * @param truth - The user-provided truth statement
 * @returns - The sanitized truth
 */
function sanitizeTruth(truth) {
  return truth
    .replace(/\n/g, ' ')        // Format consistency
    .replace(/\s+/g, ' ')        // Clean whitespace
    .trim()                      
    .slice(0, 200);              // Cost control
}

/**
 * Support function to call Azure OpenAI and generate lies from truths
 * @param truths - Array of sanitized truth statements
 * @param aiModel - AI model to use
 * @param env - Cloudflare environment with secrets
 * @returns Array of generated lies
 */
async function generateLiesFromTruths(truths, aiModel, env) {
    // Build the user message content
    const userContent = truths.join('\n');

    // Call Azure OpenAI service to generate lies based on truths
    const response = await fetch(`${env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${aiModel}/chat/completions?api-version=2024-02-15-preview`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': env.AZURE_OPENAI_API_KEY
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content: (
                        "You are the engine of a game called \"2 Truths or AI\".\n" +

                        "Rules:\n" +
                        "- Each user provides two true personal statements per set.\n" +
                        "- You generate exactly one believable false statement per set of truths.\n" +
                        "- If a user has multiple sets of truths, generate one lie for each set.\n" +

                        "Input format:\n" +
                        "- The input consists of multiple lines.\n" +
                        "- Each user is indicated by a line with this format (where # is a number): User #.\n" +
                        "- After the user indicator, every two consecutive lines represent one set of truths for that user.\n" +
                        "- Example: If User 1 has 2 sets, the format is: User 1\\ntruth1\\ntruth2\\ntruth3\\ntruth4\\nUser 2\\n...\n" +
                        "  (lines 1-2 are User 1's first set, lines 3-4 are User 1's second set)\n" +

                        "Output format:\n" +
                        "- return ONLY the generated lie statements, with no explanations, introductions, or extra text.\n" +
                        "- Each lie should be on its own line.\n" +
                        "- Generate lies in the same order as the truth sets: all lies for User 1 (one per set), then all lies for User 2, etc.\n" +
                        "- Example output for 2 users with 2 sets each: User1Set1Lie\\nUser1Set2Lie\\nUser2Set1Lie\\nUser2Set2Lie\n" +
                        "- Do not bullet point, number, or add labels to the statements.\n" +

                        "Guidelines for generating lies:\n" +
                        "- The lie must be plausible and fit naturally among the user's true statements, DO NOT contradict their statements.\n" +
                        "- The statement must not be offensive, contain offensive language, or derogatory terms.\n" +
                        "- If the user's facts are vague, make the lie vague too, but avoid being too obvious (e.g., avoid \"User likes pizza\").\n" +
                        "- If the user's facts are specific, generate a similarly specific fake statement, but they should still be believable.\n" +
                        "- Match the user's tone and style of writing (e.g., spelling mistakes, grammar issues, or informal English).\n" +
                        "- Put full stops at the end only if the user also does.\n" +
                        "- Match the user's language (if statements are not written in english use the same language as statements).\n" +
                        "- If a user provides 2 statements on the same topic, a good lie to generate would still use the same topic but say something different.\n" +
                        "- Do not say things strictly tied to the user's statements (for example if the user says \"I know how to ski\" don't say \"I once competed in a ski race\" because both are too strictly tied to skiing, you could say something like \"I have a house up in the mountains for vacations\").\n"
                    )
                },
                {
                    role: "user", 
                    content: userContent
                }
            ]
        })
    }
    );

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response data:", data);

    // Parse the response to extract lies
    const liesText = data.choices[0].message.content;
    const lies = liesText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log("Generated lies:", lies);

    //The return format should be an array of lies in the same order as the input truths
    return lies;
}