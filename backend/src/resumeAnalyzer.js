
const OLLAMA_URL = "http://localhost:11434/api/chat";

const MODEL = "hf.co/Qwen/Qwen2.5-3B-Instruct-GGUF:Q4_K_M";

export async function analyzeResume(resumeText, layoutReport) {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is required");
  }

  const prompt = `
You are a professional resume reviewer.

Analyze the following resume carefully.

Evaluate these categories:

1. Content Quality
2. Grammar and Writing
3. Skills Presentation
4. Experience Description
5. Project Descriptions
6. Section Organization
7. Professional Summary

Give each category a score between 0 and 100.

Also provide:
- Overall content score
- Strengths
- Weaknesses
- Specific improvement suggestions
- Rewritten examples for weak resume sentences

IMPORTANT:
- Never invent skills, experience, qualifications or achievements.
- Do not assume missing information.
- Be constructive and specific.
- Evaluate only the information actually present.
- Scores should be realistic, not automatically high.

Return ONLY valid JSON in this structure:

{
  "overallScore": 0,
  "summary": "Short overall review",
  "categories": [
    {
      "name": "Content Quality",
      "score": 0,
      "feedback": "Detailed feedback"
    }
  ],
  "strengths": [
    "Strength 1"
  ],
  "weaknesses": [
    "Weakness 1"
  ],
  "suggestions": [
    {
      "priority": "High",
      "title": "Suggestion title",
      "description": "Detailed suggestion"
    }
  ],
  "rewrittenExamples": [
    {
      "original": "Original resume sentence",
      "improved": "Improved sentence",
      "reason": "Why this is better"
    }
  ]
}

PDF LAYOUT REPORT:
${JSON.stringify(layoutReport)}

RESUME CONTENT:
${resumeText}
`;

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      stream: false,
      format: "json",
      options: {
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error: ${errorText}`);
  }

  const data = await response.json();

  const aiResponse = data.message?.content;

  if (!aiResponse) {
    throw new Error("AI returned an empty response");
  }

  let analysis;

  try {
    analysis = JSON.parse(aiResponse);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  return analysis;
}
