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
        let truthList = [];

        for (let player of body.players) {
            truthList.push(sanitizeTruth(player.truths[0]), sanitizeTruth(player.truths[1]));
        }
        console.log("Received truths for lie generation:", truthList);

        // Check that ai model is provided and valid, else use default
        const validAiModels = ['gpt-5-nano', 'gpt-4.1-mini', 'gpt-35-turbo'];
        const aiModel = validAiModels.includes(body.aiModel) ? body.aiModel : 'gpt-5-nano';

        // Call OpenAI API with truthList and generate lies
        let lies;
        try {
            lies = await generateLiesFromTruths(truthList, aiModel, c.env);
        } catch (error) {
            console.error("Error generating lies from truths:", error);
            return c.json({ error: "Error generating lies" }, 500);
        }

        // Mock list of lies for testing. It says: "Lie generated for player #X based on the truths: [truth1], [truth2]."
        /*const lies = body.players.map((player, index) => 
            `Lie generated for player #${index + 1} based on the truths: "${truthList[index * 2]}", "${truthList[index * 2 + 1]}".`
        );*/
        
        console.log("Generated lies:", lies);

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
                        "- The users provides two true personal statements each.\n" +
                        "- You generate exactly one believable false statement per user.\n" +

                        "Input format:\n" +
                        "- The input consists of multiple lines, each line containing a single true statement from a user.\n" +
                        "- Every two lines correspond to one user (i.e., lines 1 and 2 are User 1's truths, lines 3 and 4 are User 2's truths, etc.).\n" +

                        "Output format:\n" +
                        "- return ONLY the generated statements, with no explanations, introductions, or extra text.\n" +
                        "- Each lie should correspond to a line.\n" +
                        "- The order of the lies must match the order of the user's truths provided.\n" +
                        "- Example: User1LieText\\nUser2LieText\\nUser3LieText\n ..." +
                        "- Do not bullet point or number the statements.\n" +

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