// FIX: Import LiveSession and remove unused Chat import.
import { GoogleGenAI, GenerateContentResponse, Part, Tool, Content, Modality, LiveServerMessage, Blob, FunctionDeclaration, Type, LiveSession } from "@google/genai";
import { UploadedFile } from "./types";

// The `window.aistudio` object is expected to be globally available in the execution environment.

const getGoogleAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION: Content = {
    role: 'user',
    parts: [{
        text: `You are a world-class, multi-disciplinary AI assistant named 'Pro AI'. Your capabilities are vast and your standards are exceptionally high.

**Core Directives:**
1.  **Extreme Accuracy & Verification:** For any factual claim, you must verify it at least 7 times from over 20 different authoritative sources before presenting it. If sources conflict or are insufficient, state that the information is not verifiable.
2.  **Academic & Research Prowess:** You are an expert in academic writing and research. You can draft, review, format, and perfect PhD dissertations, Master's theses, and scientific papers across all fields. You will ensure perfect citation, structure, and academic tone.
3.  **Master Programmer:** You can write, debug, and explain code in all modern programming languages, including but not limited to Python, JavaScript, TypeScript, Java, C++, Go, Rust, and SQL. Your code will be clean, efficient, and well-documented.
4.  **Multimedia Genius:** You can generate highly professional, unlimited images, videos, and audio.
5.  **Business & Strategy Expert:** You can create comprehensive marketing plans, economic analyses, and detailed business studies with professional-grade quality.
6.  **Deep Islamic Knowledge:** You have been trained on the Quran (Uthmani script, Medina Mushaf with translations), the complete works of Ibn Taymiyyah, Al-Sha'rawi, Al-Qaradawi, Sahih al-Bukhari, Sahih Muslim, and Tafsir Ibn Kathir. You will answer questions related to Islam with reverence, accuracy, and by citing your sources from these texts.
7.  **Personal Assistant:** You can manage schedules, set reminders, and organize information like a top-tier executive assistant.
8.  **Safety First:** You will strictly refuse to engage with or generate any sexually explicit, nude, or otherwise inappropriate content. You will politely decline any such requests.
9.  **Language Proficiency:** You are fluent in Arabic and English, and can translate between them and any other language with professional accuracy.
10. **Web Integration:** When asked for websites or resources, you can generate clickable URLs.

**Interaction Style:**
- Professional, clear, and comprehensive.
- When generating content, always aim for the highest possible quality.
- Be proactive. If a user asks for a plan, suggest different frameworks or angles to consider.`
    }]
};


const fileToPart = (file: { base64: string; mimeType: string; }): Part => ({
  inlineData: {
    data: file.base64,
    mimeType: file.mimeType,
  },
});

export const generateChatContent = async (
    prompt: string,
    files: UploadedFile[],
    tools: Tool[] = [],
    model: string = 'gemini-2.5-flash',
    thinkingBudget?: number
): Promise<GenerateContentResponse> => {
  const ai = getGoogleAI();
  const mediaParts = files.filter(f => f.base64).map(f => fileToPart({base64: f.base64!, mimeType: f.mimeType}));
  const textParts = [{ text: prompt }];
  
  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [...mediaParts, ...textParts] },
    config: {
        systemInstruction: SYSTEM_INSTRUCTION.parts,
        ...(tools.length > 0 && { tools }),
        ...(thinkingBudget && { thinkingConfig: { thinkingBudget } }),
    }
  });

  return response;
};

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const ai = getGoogleAI();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio,
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    return response.generatedImages[0].image.imageBytes;
  }
  throw new Error("Image generation failed.");
};

export const editImage = async (prompt: string, image: UploadedFile): Promise<string> => {
    const ai = getGoogleAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: image.base64!, mimeType: image.mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        return part.inlineData.data;
    }
    throw new Error("Image editing failed.");
};

export const generateVideo = async (prompt: string, image: UploadedFile | null, onProgress: (message: string) => void): Promise<string> => {
  onProgress('Initializing video generation...');
  const ai = getGoogleAI();
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    ...(image && { image: { imageBytes: image.base64!, mimeType: image.mimeType } }),
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9',
    },
  });

  onProgress('Video generation started. This may take a few minutes...');
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    onProgress('Checking video status...');
    try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch (e) {
        if (e instanceof Error && e.message.includes("Requested entity was not found.")) {
             throw new Error("API key error. Please re-select your API key.");
        }
        throw e;
    }
  }

  onProgress('Video created! Fetching video data...');

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("Failed to get video download link.");
  }

  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }
  
  const videoBlob = await videoResponse.blob();
  onProgress('Video downloaded successfully.');
  
  return URL.createObjectURL(videoBlob);
};

export const textToSpeech = async (text: string): Promise<string> => {
    const ai = getGoogleAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        // FIX: Return raw base64 audio data as per API specification, not a data URL.
        return base64Audio;
    }
    throw new Error("Text-to-speech conversion failed.");
};

export const transcribeAudio = async (audioFile: UploadedFile): Promise<string> => {
    const ai = getGoogleAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: "Transcribe the following audio in the original language:" },
                fileToPart({ base64: audioFile.base64!, mimeType: audioFile.mimeType }),
            ]
        },
    });
    return response.text;
};

// --- Live Session Manager ---
export class LiveSessionManager {
    private ai: GoogleGenAI;
    // FIX: Use the correct LiveSession type for the session promise.
    private sessionPromise: Promise<LiveSession> | null = null;

    constructor() {
        this.ai = getGoogleAI();
    }

    async connect(callbacks: {
        onMessage: (message: LiveServerMessage) => void;
        onError: (error: ErrorEvent) => void;
        onClose: (event: CloseEvent) => void;
        onOpen: () => void;
    }) {
        if (this.sessionPromise) {
            console.warn("Session already connecting or connected.");
            return;
        }

        this.sessionPromise = this.ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: callbacks.onOpen,
                onmessage: callbacks.onMessage,
                onerror: callbacks.onError,
                onclose: callbacks.onClose,
            },
            config: {
                responseModalities: [Modality.AUDIO],
                outputAudioTranscription: {},
                inputAudioTranscription: {},
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: 'You are a friendly and helpful conversational AI. Keep your responses concise and to the point.',
            },
        });
    }

    send(data: Float32Array) {
        if (!this.sessionPromise) {
            console.error("Session not connected. Cannot send data.");
            return;
        }
        
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }

        let binary = '';
        const len = int16.buffer.byteLength;
        const bytes = new Uint8Array(int16.buffer);
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const b64 = btoa(binary);

        const pcmBlob: Blob = {
            data: b64,
            mimeType: 'audio/pcm;rate=16000',
        };

        this.sessionPromise.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
        });
    }

    async close() {
        if (this.sessionPromise) {
            const session = await this.sessionPromise;
            session.close();
            this.sessionPromise = null;
        }
    }
}