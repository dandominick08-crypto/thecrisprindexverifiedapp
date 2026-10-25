const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-terra';

function cleanText(value, max = 12000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function normalizePaper(raw = {}) {
  const fields = [
    'title','authors','journal','technique','application','abstract','researchQuestion',
    'methods','mainFinding','whyMatters','limitations','doi','researchType','sourceUrl','citationStatus'
  ];
  const paper = {};
  for (const field of fields) paper[field] = cleanText(raw[field], 10000);
  paper.year = Number.isFinite(Number(raw.year)) ? Number(raw.year) : null;
  return paper;
}

function outputText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const parts = [];
  for (const item of data?.output || []) {
    if (item?.type !== 'message') continue;
    for (const content of item.content || []) {
      if ((content?.type === 'output_text' || content?.type === 'text') && content.text) parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST for AI Tutor questions.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'The AI Tutor is not configured yet. Add OPENAI_API_KEY to the deployment environment.' });
  }

  const question = cleanText(req.body?.question, 2500);
  const paper = normalizePaper(req.body?.paper);
  const history = Array.isArray(req.body?.history)
    ? req.body.history.slice(-10).map(m => ({
        role: m?.role === 'assistant' ? 'assistant' : 'user',
        content: cleanText(m?.content, 4000)
      })).filter(m => m.content)
    : [];

  if (!question) return res.status(400).json({ error: 'Please enter a question.' });
  if (!paper.title) return res.status(400).json({ error: 'No research paper is selected.' });

  const paperContext = `
SELECTED PAPER CONTEXT FROM THE CRISPR INDEX
Title: ${paper.title || 'Not available'}
Authors: ${paper.authors || 'Not available'}
Journal: ${paper.journal || 'Not available'}
Year: ${paper.year || 'Not available'}
Technique: ${paper.technique || 'Not available'}
Application: ${paper.application || 'Not available'}
Research type: ${paper.researchType || 'Not available'}
DOI: ${paper.doi || 'Not available'}
Source URL: ${paper.sourceUrl || 'Not available'}
Citation status: ${paper.citationStatus || 'Not available'}

Abstract / stored overview:
${paper.abstract || 'Not available'}

Research Question:
${paper.researchQuestion || 'Not available'}

What the Researchers Did:
${paper.methods || 'Not available'}

Main Finding:
${paper.mainFinding || 'Not available'}

Why It Matters:
${paper.whyMatters || 'Not available'}

Limitations:
${paper.limitations || 'Not available'}
`.trim();

  const instructions = `You are the AI Tutor for The CRISPR Index, a student-created biotechnology learning website for students roughly aged 13–18.

Your job is to answer the student's actual question naturally, not force it into a preset category. You can answer follow-up questions and broader biology, genetics, biotechnology, CRISPR, medicine, and research-method questions.

Important scientific rules:
- When discussing the selected paper, treat the supplied paper context as the primary source of truth.
- Never invent a result, sample size, method, figure, statistic, citation, DOI, author, or limitation that is not supported by the supplied context.
- If the student asks about a detail that the supplied context does not contain, say that clearly. You can explain the general scientific concept separately, but label it as general background rather than a finding from this paper.
- Distinguish what the researchers demonstrated from what might be possible in the future.
- Define unfamiliar scientific terms the first time you use them.
- If asked about a graph or figure that has not been provided, say you need the graph/figure or its caption to interpret it accurately.
- Encourage checking the original paper when a precise detail matters.
- Do not make medical diagnoses or give personalized treatment instructions. For medical questions, provide educational information and encourage speaking with an appropriate healthcare professional where relevant.

Writing style:
- Sound like a knowledgeable, enthusiastic Grade 10 biology student helping another student understand the science.
- Be clear, natural, concise, and scientifically responsible.
- Use short paragraphs. Use bullets only when they genuinely make the answer easier to understand.
- Avoid corporate language, hype, and unnecessary jargon.

${paperContext}`;

  const input = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: question }
  ];

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input,
        reasoning: { effort: 'low' },
        max_output_tokens: 900,
        store: false
      })
    });

    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', data?.error?.message || data);
      return res.status(openaiResponse.status >= 500 ? 502 : 400).json({
        error: data?.error?.message || 'The AI service returned an error.'
      });
    }

    const answer = outputText(data);
    if (!answer) return res.status(502).json({ error: 'The AI service returned an empty answer.' });
    return res.status(200).json({ answer, model: MODEL });
  } catch (error) {
    console.error('AI Tutor request failed:', error);
    return res.status(502).json({ error: 'Could not connect to the AI service.' });
  }
}
