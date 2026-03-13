import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Load All Keys (12 Keys Total)
const groqKeys = [
    import.meta.env.VITE_GROQ_API_KEY_1 || "",
    import.meta.env.VITE_GROQ_API_KEY_2 || "",
    import.meta.env.VITE_GROQ_API_KEY_3 || "",
    import.meta.env.VITE_GROQ_API_KEY_4 || ""
].filter(key => key !== "");

const openRouterKeys = [
    import.meta.env.VITE_OPENROUTER_API_KEY_1 || "",
    import.meta.env.VITE_OPENROUTER_API_KEY_2 || "",
    import.meta.env.VITE_OPENROUTER_API_KEY_3 || "",
    import.meta.env.VITE_OPENROUTER_API_KEY_4 || ""
].filter(key => key !== "");

const geminiKeys = [
    import.meta.env.VITE_GEMINI_API_KEY_1 || "",
    import.meta.env.VITE_GEMINI_API_KEY_2 || "",
    import.meta.env.VITE_GEMINI_API_KEY_3 || "",
    import.meta.env.VITE_GEMINI_API_KEY_4 || ""
].filter(key => key !== "");

console.log("Triple-Tier AI Active:", {
    Groq: groqKeys.length,
    OpenRouter: openRouterKeys.length,
    Gemini: geminiKeys.length,
    Total: groqKeys.length + openRouterKeys.length + geminiKeys.length
});

const GEMINI_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
const API_VERSIONS = ['v1', 'v1beta'] as const;

/**
 * EXPERT KNOWLEDGE BASE (Offline Free Fallback)
 */
const academicLibrary: Record<string, string> = {
    "binary tree": `## Data Structures: Binary Trees

A **Binary Tree** is a hierarchical structure where each node has at most two children: the left child and the right child.

### Fundamental Properties
*   **Root:** The top-most node of the tree.
*   **Leaf:** Nodes with no children.
*   **Height:** Edges on the longest path from root to leaf.
*   **Depth:** Edges from root to the specific node.

### Traversal Methods
1.  **Pre-order:** Root -> Left -> Right
2.  **In-order:** Left -> Root -> Right
3.  **Post-order:** Left -> Right -> Root`,

    "photosynthesis": `## Biological Sciences: Photosynthesis

**Photosynthesis** is the process by which green plants use sunlight to synthesize foods from carbon dioxide and water.

### The Light Equation
\`6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\`

### Key Phases
*   **Light Reactions:** Capture energy in the thylakoid.
*   **Calvin Cycle:** Fixes carbon in the stroma.`,

    "newton": `## Physics: Newton's Laws of Motion

1.  **Inertia:** Objects resist changes in their state of motion.
2.  **F = ma:** Force equals mass times acceleration.
3.  **Action/Reaction:** For every action, there is an equal and opposite reaction.`
};

export const generateExplanation = async (prompt: string, options: { skipLibrary?: boolean; raw?: boolean } = {}): Promise<string> => {
    const normalizedPrompt = prompt.toLowerCase();

    // 1. Check Local Expert Library (Instant/Free)
    if (!options.skipLibrary) {
        for (const [key, response] of Object.entries(academicLibrary)) {
            if (normalizedPrompt.includes(key)) {
                return new Promise((resolve) => setTimeout(() => resolve(response), 400));
            }
        }
    }

    // 2. TIER 1: Groq Rotation (Ultra-fast)
    if (groqKeys.length > 0) {
        for (let i = 0; i < groqKeys.length; i++) {
            const currentKey = groqKeys[i];
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${currentKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: options.raw ? "You are a specialized JSON data generator. Return ONLY raw JSON code. No conversation." : "You are a senior academic assistant. Provide structured, professional markdown-only explanations. No emojis." },
                            { role: "user", content: prompt }
                        ],
                        temperature: options.raw ? 0.1 : 0.3,
                        max_tokens: 1024
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.choices[0].message.content;
                }
            } catch (err) { continue; }
        }
    }

    // 3. TIER 2: OpenRouter Rotation (High Model Choice)
    if (openRouterKeys.length > 0) {
        for (let k = 0; k < openRouterKeys.length; k++) {
            const currentKey = openRouterKeys[k];
            try {
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${currentKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://study-sphere.edu", // Optional tracking
                        "X-Title": "Study Sphere Hackathon"
                    },
                    body: JSON.stringify({
                        model: "meta-llama/llama-3.1-8b-instruct:free",
                        messages: [
                            { role: "system", content: options.raw ? "JSON Generator. Return clean JSON array or object ONLY." : "Senior academic assistant. Professional markdown. No emojis." },
                            { role: "user", content: prompt }
                        ]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.choices[0].message.content;
                }
            } catch (err) { continue; }
        }
    }

    // 4. TIER 3: Gemini Rotation (Strong Reasoning)
    if (geminiKeys.length > 0) {
        for (let j = 0; j < geminiKeys.length; j++) {
            const genAI = new GoogleGenerativeAI(geminiKeys[j]);
            for (const version of API_VERSIONS) {
                for (const modelId of GEMINI_MODELS) {
                    try {
                        const activeModel = genAI.getGenerativeModel({ model: modelId }, { apiVersion: version });
                        const finalPrompt = options.raw ? prompt : `Explain "${prompt}" professionally and concisely in academic markdown. No emojis.`;
                        const result = await activeModel.generateContent(finalPrompt);
                        const text = result.response.text();
                        if (text) return text;
                    } catch (e) { continue; }
                }
            }
        }
    }

    // 5. Final Generic Response
    return options.raw ? "[]" : `## Academic Overview: ${prompt}

We are currently experiencing extremely high demand. 

### Presentation Tip
*   Try "Thermodynamics" or "Newton" for an instant demo.
*   Refresh and wait 10 seconds.

> [!TIP]
> The app is automatically cycling through 12 different API providers to fulfill your request.`;
};

/**
 * Robustly extracts a JSON array or object from an AI response string.
 * Handles markdown blocks and conversational chatter.
 */
export const extractJSON = <T>(input: string): T => {
    try {
        // Find the first occurrence of [ or {
        const startIdx = input.search(/[\[\{]/);
        // Find the last occurrence of ] or }
        const endIdx = input.lastIndexOf(input[startIdx] === '[' ? ']' : '}');

        if (startIdx === -1 || endIdx === -1) {
            throw new Error("No JSON structure found in response");
        }

        const jsonStr = input.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonStr) as T;
    } catch (e) {
        console.error("JSON Extraction failed:", e);
        // Fallback for very messy strings - try direct parse
        return JSON.parse(input.replace(/```json|```/g, "").trim()) as T;
    }
};
