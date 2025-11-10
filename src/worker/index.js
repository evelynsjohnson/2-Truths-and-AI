import { Hono } from 'hono';

const app = new Hono();

// CORS is not needed since the frontend and backend are served from the same origin
// (both through Cloudflare Workers).

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

        /*//Mock AI call for testing
        liesArray = body.players.flatMap((player, index) => {
            const numTruthSets = Math.floor(player.truths.length / 2);
            const playerLies = [];
            for (let j = 0; j < numTruthSets; j++) {
                playerLies.push(
                    `Lie generated for set #${j + 1} of player #${index + 1}.`
                );
            }
            return playerLies;
        });*/
        
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
                        "You are the engine of a game called \"2 Truths or AI\". Your role is to generate plausible lies that blend in with players' true statements.\n\n" +

                        "Rules:\n" +
                        "- Each user provides two true personal statements per set.\n" +
                        "- You generate exactly ONE believable false statement per set of truths.\n" +
                        "- If a user has multiple sets of truths, generate one lie for each set.\n\n" +

                        "Input format:\n" +
                        "- The input consists of multiple lines.\n" +
                        "- Each user is indicated by \"User #\" (where # is a number).\n" +
                        "- After the user indicator, every two consecutive lines represent one set of truths for that user.\n" +
                        "- Example: User 1\\ntruth1\\ntruth2\\ntruth3\\ntruth4\\nUser 2\\ntruth1\\ntruth2\n" +
                        "  (User 1 has 2 sets: lines 1-2 are set 1, lines 3-4 are set 2)\n\n" +

                        "Output format:\n" +
                        "- Return ONLY the generated lie statements, one per line.\n" +
                        "- No explanations, introductions, bullet points, numbers, or labels.\n" +
                        "- Order: all lies for User 1 (one per set), then all lies for User 2, etc.\n" +
                        "- Example for 2 users with 2 sets each:\n" +
                        "  User1Set1Lie\\nUser1Set2Lie\\nUser2Set1Lie\\nUser2Set2Lie\n\n" +

                        "CRITICAL - How to generate believable lies:\n\n" +

                        "1. NEVER contradict or negate the user's truths:\n" +
                        "   ❌ BAD: Truth: \"Star Wars is my favorite movie\" → Lie: \"I've never seen Star Wars\"\n" +
                        "   ✓ GOOD: Truth: \"Star Wars is my favorite movie\" → Lie: \"I attended a movie premiere in Hollywood\"\n\n" +

                        "2. Use DIFFERENT topics or contexts from the truths (related but distinct):\n" +
                        "   ❌ BAD: Truth: \"I go to the beach north of Chicago every weekend\" → Lie: \"I love going to the beach north of Chicago\"\n" +
                        "   ✓ GOOD: Truth: \"I go to the beach north of Chicago every weekend\" → Lie: \"I'm training for a triathlon this summer\"\n\n" +

                        "3. Make lies that are THEMATICALLY ADJACENT but not identical:\n" +
                        "   - If truths are about outdoor activities → lie could be about sports, travel, or nature\n" +
                        "   - If truths are about food → lie could be about cooking, restaurants, or cultural experiences\n" +
                        "   - If truths are about work → lie could be about education, skills, or career achievements\n\n" +

                        "4. Match the specificity level:\n" +
                        "   - Vague truths → vague lie (but not generic like \"I like pizza\")\n" +
                        "   - Specific truths → specific lie with concrete details\n\n" +

                        "5. Match the user's writing style:\n" +
                        "   - Tone (casual, formal, enthusiastic)\n" +
                        "   - Grammar and spelling (including mistakes if present)\n" +
                        "   - Punctuation habits (full stops, capitalization)\n" +
                        "   - Language (use the same language as the user's statements)\n\n" +

                        "6. Keep lies appropriate:\n" +
                        "   - No offensive, derogatory, or hateful content\n" +
                        "   - No explicit or inappropriate material\n\n" +

                        "Remember: The lie should sound like something the user COULD have said, but about a DIFFERENT aspect of their life or interests.\n"
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