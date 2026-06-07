const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function runAIAnalysis(transcript) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // Format transcript list into readable lines for the model
    const formattedTranscript = transcript
        .map(t => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
        .join('\n');

    const prompt = `You are a meeting analysis assistant. Analyze the meeting transcript below and extract:
1. A brief summary of the meeting.
2. Important decisions made.
3. Action items (tasks, assignees, and timestamps).
4. Follow-up suggestions.

Strict Grounding Rules:
- Do not invent attendees, action items, decisions, or outcomes not explicitly present in the transcript.
- Every insight must have a citation referencing the transcript timestamp (e.g. "00:10").
- If the assignee of an action item is not explicitly named, set the assignee field to "Unassigned".

Transcript:
${formattedTranscript}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    summary: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                text: { type: "STRING" },
                                citations: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            timestamp: { type: "STRING" }
                                        },
                                        required: ["timestamp"]
                                    }
                                }
                            },
                            required: ["text", "citations"]
                        }
                    },
                    decisions: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                text: { type: "STRING" },
                                citations: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            timestamp: { type: "STRING" }
                                        },
                                        required: ["timestamp"]
                                    }
                                }
                            },
                            required: ["text", "citations"]
                        }
                    },
                    followUps: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                text: { type: "STRING" },
                                citations: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            timestamp: { type: "STRING" }
                                        },
                                        required: ["timestamp"]
                                    }
                                }
                            },
                            required: ["text", "citations"]
                        }
                    },
                    actionItems: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                task: { type: "STRING" },
                                assignee: { type: "STRING" },
                                citations: {
                                    type: "ARRAY",
                                    items: {
                                        type: "OBJECT",
                                        properties: {
                                            timestamp: { type: "STRING" }
                                        },
                                        required: ["timestamp"]
                                    }
                                }
                            },
                            required: ["task", "assignee", "citations"]
                        }
                    }
                },
                required: ["summary", "decisions", "followUps", "actionItems"]
            }
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
        throw new Error('Failed to retrieve content from Gemini API');
    }

    return JSON.parse(candidateText);
}

module.exports = { runAIAnalysis };
