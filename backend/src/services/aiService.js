const AI_UNAVAILABLE = 'AI service is temporarily unavailable.';

class AIServiceError extends Error {
  constructor(message = AI_UNAVAILABLE, status = 503) {
    super(message);
    this.name = 'AIServiceError';
    this.status = status;
  }
}

const cleanText = (value, max = 4000) => String(value || '').trim().slice(0, max);

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const isRetryableStatus = (status) => status === 408 || status === 429 || status === 503 || status >= 500;

const sanitizeProviderPayload = (payload) => {
  const serialized = JSON.stringify(payload, (key, value) => {
    if (/key|token|secret|authorization|password/i.test(key)) return '[REDACTED]';
    return value;
  });
  return serialized.slice(0, 1200);
};

const getPromptMetadata = (user) => {
  try {
    const parsed = JSON.parse(user);
    return {
      kind: parsed.kind || 'unknown',
      userKeys: Object.keys(parsed).sort(),
      contextKeys: parsed.context ? Object.keys(parsed.context).sort() : [],
      bytes: Buffer.byteLength(user, 'utf8'),
    };
  } catch {
    return { kind: 'unknown', userKeys: [], contextKeys: [], bytes: Buffer.byteLength(user, 'utf8') };
  }
};

const extractJson = (content) => {
  const text = String(content || '').trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end <= start) throw new AIServiceError('AI returned an invalid structured response.', 502);
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      throw new AIServiceError('AI returned an invalid structured response.', 502);
    }
  }
};

const callProvider = async (system, user) => {
  if (process.env.AI_PROVIDER === 'mock') return mockResponse(user);
  if (!process.env.AI_API_KEY || !process.env.AI_API_URL || !process.env.AI_MODEL) {
    throw new AIServiceError('AI service is not configured. Set AI_API_KEY in backend/.env.');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS) || 30000);
  try {
    const isGemini = process.env.AI_PROVIDER === 'gemini';
    const requestBody = isGemini
      ? {
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }
      : {
          model: process.env.AI_MODEL,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        };
    const requestBodyText = JSON.stringify(requestBody);
    const promptMetadata = getPromptMetadata(user);
    console.log(`[AI Provider Request] provider=${isGemini ? 'gemini' : 'openai-compatible'} feature=${promptMetadata.kind} bytes=${promptMetadata.bytes} bodyKeys=${Object.keys(requestBody).sort().join(',')} userKeys=${promptMetadata.userKeys.join(',')} contextKeys=${promptMetadata.contextKeys.join(',')}`);

    const maxAttempts = isGemini ? 3 : 1;
    let lastProviderError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await fetch(process.env.AI_API_URL, {
          method: 'POST',
          headers: isGemini
            ? { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.AI_API_KEY }
            : { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` },
          body: requestBodyText,
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok) {
          const sanitizedError = sanitizeProviderPayload(payload);
          lastProviderError = { status: response.status, body: sanitizedError };
          console.error(`[AI Provider Error] provider=${isGemini ? 'gemini' : 'openai-compatible'} feature=${promptMetadata.kind} attempt=${attempt}/${maxAttempts} HTTP ${response.status}: ${sanitizedError}`);
          if (isGemini && isRetryableStatus(response.status) && attempt < maxAttempts) {
            const delay = (2 ** (attempt - 1)) * 250 + Math.floor(Math.random() * 150);
            await sleep(delay);
            continue;
          }
          throw new AIServiceError();
        }

        if (isGemini) {
          const generatedText = payload.candidates?.[0]?.content?.parts
            ?.map((part) => (typeof part?.text === 'string' ? part.text : ''))
            .join('')
            .trim();
          return extractJson(generatedText);
        }

        return extractJson(payload.choices?.[0]?.message?.content);
      } catch (error) {
        if (error instanceof AIServiceError) {
          error.providerStatus = lastProviderError?.status;
          error.providerMessage = lastProviderError?.body;
          throw error;
        }
        throw error;
      }
    }

    throw new AIServiceError();
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError();
  } finally {
    clearTimeout(timeout);
  }
};

const validateBreakdown = (data) => {
  if (!data || typeof data.summary !== 'string' || !Array.isArray(data.skills) || !Array.isArray(data.milestones)) throw new AIServiceError('AI breakdown failed validation.', 502);
  data.milestones = data.milestones.filter((milestone) => milestone && typeof milestone.title === 'string' && Array.isArray(milestone.tasks)).map((milestone) => ({ ...milestone, tasks: milestone.tasks.filter((task) => task && typeof task.title === 'string').map((task) => ({ title: cleanText(task.title, 160), description: cleanText(task.description, 800), priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium', estimatedHours: Number(task.estimatedHours) || 0, dependencies: Array.isArray(task.dependencies) ? task.dependencies.map((value) => cleanText(value, 120)).slice(0, 10) : [] })) })).slice(0, 20);
  if (!data.milestones.length) throw new AIServiceError('AI breakdown contained no valid milestones.', 502);
  return { summary: cleanText(data.summary, 1500), category: cleanText(data.category, 100), skills: data.skills.map((skill) => cleanText(skill, 80)).filter(Boolean).slice(0, 20), estimatedHours: Number(data.estimatedHours) || 0, milestones: data.milestones };
};

const validateMatch = (data) => {
  if (!data || typeof data.matchScore !== 'number' || !Array.isArray(data.reasons) || !Array.isArray(data.weakSkills)) throw new AIServiceError('AI matching result failed validation.', 502);
  return { ...data, matchScore: Math.max(0, Math.min(100, Math.round(data.matchScore))), reasons: data.reasons.map((value) => cleanText(value, 200)).slice(0, 8), weakSkills: data.weakSkills.map((value) => cleanText(value, 100)).slice(0, 8), experience: cleanText(data.experience, 500) };
};

const validateEstimate = (data) => {
  if (!data || typeof data.complexity !== 'string' || typeof data.reason !== 'string') throw new AIServiceError('AI estimate failed validation.', 502);
  return { estimatedHoursMin: Math.max(0, Number(data.estimatedHoursMin) || 0), estimatedHoursMax: Math.max(0, Number(data.estimatedHoursMax) || 0), complexity: ['low', 'medium', 'high'].includes(data.complexity.toLowerCase()) ? data.complexity.toLowerCase() : 'medium', reason: cleanText(data.reason, 1000), isEstimate: true };
};

const validateHealth = (data) => {
  if (!data || !['Healthy', 'At Risk', 'Blocked'].includes(data.status) || typeof data.summary !== 'string' || !Array.isArray(data.keyIssues) || !Array.isArray(data.suggestedActions)) throw new AIServiceError('AI health result failed validation.', 502);
  return { ...data, keyIssues: data.keyIssues.map((value) => cleanText(value, 240)).slice(0, 8), suggestedActions: data.suggestedActions.map((value) => cleanText(value, 240)).slice(0, 8), isEstimate: false };
};

const validateCopilot = (data) => {
  if (!data || typeof data.answer !== 'string' || !Array.isArray(data.references)) throw new AIServiceError('AI copilot response failed validation.', 502);
  return { answer: cleanText(data.answer, 2500), references: data.references.map((value) => cleanText(value, 180)).slice(0, 10) };
};

const mockResponse = (prompt) => {
  const parsed = JSON.parse(prompt);
  if (parsed.kind === 'breakdown') return { summary: `Structured planning outline for ${parsed.requirement.title || 'the requested project'}.`, category: parsed.requirement.category || 'Web Development', skills: parsed.requirement.skills?.length ? parsed.requirement.skills : ['JavaScript', 'REST APIs', 'Testing'], estimatedHours: 40, milestones: [{ title: 'Foundation', description: 'Set up the core project foundation.', tasks: [{ title: 'Set up project structure', description: 'Create the application structure and development workflow.', priority: 'high', estimatedHours: 8, dependencies: [] }, { title: 'Add initial tests', description: 'Create a baseline test suite for critical paths.', priority: 'medium', estimatedHours: 6, dependencies: ['Set up project structure'] }] }] };
  if (parsed.kind === 'match') return { matchScore: 75, reasons: ['Relevant profile skills match the project requirements.'], weakSkills: [], experience: 'Advisory match based on profile skills and project requirements.' };
  if (parsed.kind === 'estimate') return { estimatedHoursMin: 8, estimatedHoursMax: 16, complexity: 'medium', reason: 'Estimate considers implementation, validation, testing, and integration.' };
  if (parsed.kind === 'health') return { status: parsed.context.metrics.overdueTasks > 0 ? 'At Risk' : 'Healthy', summary: 'Health summary based on the supplied project task and milestone data.', keyIssues: parsed.context.metrics.overdueTasks > 0 ? [`${parsed.context.metrics.overdueTasks} overdue task(s) need attention.`] : [], suggestedActions: ['Review pending work against the project deadline.'] };
  return { answer: `Based on the current project data, ${parsed.question} Review the listed tasks and milestones in the workspace for the next action.`, references: parsed.context.tasks.slice(0, 3).map((task) => task.title) };
};

const generateProjectBreakdown = async (requirement) => validateBreakdown(await callProvider('Return only valid JSON for a project breakdown with summary, category, skills, estimatedHours, milestones[].tasks[].', JSON.stringify({ kind: 'breakdown', requirement })));
const generateFreelancerMatch = async (project, freelancer) => validateMatch(await callProvider('Return only valid JSON for an advisory freelancer match with matchScore, reasons, weakSkills, experience. Never call the score a probability.', JSON.stringify({ kind: 'match', project, freelancer })));
const estimateTaskEffort = async (project, task) => validateEstimate(await callProvider('Return only valid JSON for an effort estimate. Clearly treat hours as an estimate, not a deadline.', JSON.stringify({ kind: 'estimate', project, task })));
const analyzeProjectHealth = async (context) => validateHealth(await callProvider('Return only valid JSON for project health with status, summary, keyIssues, suggestedActions. Use only supplied facts.', JSON.stringify({ kind: 'health', context })));
const askProjectCopilot = async (context, question) => validateCopilot(await callProvider('Answer only from the supplied project context. If the answer is unavailable, say so. Return JSON with answer and references.', JSON.stringify({ kind: 'copilot', context, question: cleanText(question, 500) })));

module.exports = { AIServiceError, generateProjectBreakdown, generateFreelancerMatch, estimateTaskEffort, analyzeProjectHealth, askProjectCopilot };