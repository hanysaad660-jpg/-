



import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { SendIcon, MicIcon, PaperclipIcon, ImageIcon, DocumentIcon, AudioIcon, VideoIcon, BotIcon, ChatIcon, VideoSparkIcon, GoogleIcon, SparkIcon, StopIcon, AudioSparkIcon, SpeakerIcon, ScreenRecIcon } from './components/Icons';
import { ChatMessage as ChatMessageType, UploadedFile, MessageRole, MessageContent, AppMode, AspectRatio, GroundingSource } from './types';
import * as GeminiService from './services/geminiService';
import { LiveServerMessage } from '@google/genai';


declare const mammoth: any;
declare const pdfjsLib: any;

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

// START FIX: Add audio decoding functions as per guidelines
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}
// END FIX

const FileIcon = ({ fileType, className }: { fileType: UploadedFile['type'], className?: string }) => {
    switch (fileType) {
        case 'image': return <ImageIcon className={className} />;
        case 'audio': return <AudioIcon className={className} />;
        case 'video': return <VideoIcon className={className} />;
        case 'document': return <DocumentIcon className={className} />;
        default: return <PaperclipIcon className={className} />;
    }
}
// --- Audio Processing for Live ---
// FIX: Correctly handle vendor-prefixed AudioContext for wider browser support.
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
// START FIX: Add output audio context and state for playback as per guidelines
const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();
// END FIX
let scriptProcessor: ScriptProcessorNode | null = null;
let mediaStreamSource: MediaStreamAudioSourceNode | null = null;
const liveSessionManager = new GeminiService.LiveSessionManager();
//---
export default function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'init',
      role: MessageRole.MODEL,
      content: [{ type: 'text', data: 'مرحباً! أنا مساعدك الذكي الاحترافي. اختر وضعًا أو اسألني أي شيء للبدء.' }]
    }
  ]);
  const [input, setInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeySelected, setIsApiKeySelected] = useState(true);
  
  // App Mode State
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  
  // Mode-specific settings
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  const [useFastMode, setUseFastMode] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<AspectRatio>("1:1");
  const [useVideoDemoMode, setUseVideoDemoMode] = useState(false);
  
  // Live session state
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState<{userInput: string, modelInput: string}>({userInput: '', modelInput: ''});

  // Screen recording state
  const [isScreenRecording, setIsScreenRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const checkApiKey = useCallback(async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsApiKeySelected(hasKey);
      return hasKey;
    }
    return true; // Assume true if check is not available
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  useEffect(() => {
    const generateInitialVideo = async () => {
        const hasKey = await (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function' ? window.aistudio.hasSelectedApiKey() : Promise.resolve(true));

        if (!hasKey) {
            console.log("Skipping initial video generation: API key not selected.");
            return;
        }

        const prompt = "A 5-second video clip of a futuristic cityscape at sunset.";
        const loadingMessageId = 'initial-video-loading';
        
        setMessages(prev => [...prev, {
            id: loadingMessageId,
            role: MessageRole.MODEL,
            content: [{ type: 'loading', data: `Generating demo video...`, expectedType: 'video' }]
        }]);

        try {
            const videoUrl = await GeminiService.generateVideo(prompt, null, (progressMessage) => {
                 setMessages(prev => {
                    const newMessages = [...prev];
                    const msgIndex = newMessages.findIndex(m => m.id === loadingMessageId);
                    if (msgIndex > -1 && newMessages[msgIndex].content[0].type === 'loading') {
                       newMessages[msgIndex].content = [{ type: 'loading', data: progressMessage, expectedType: 'video' }];
                    }
                    return newMessages;
                });
            });

            setMessages(prev => {
                const newMessages = [...prev];
                const msgIndex = newMessages.findIndex(m => m.id === loadingMessageId);
                if (msgIndex > -1) {
                    newMessages[msgIndex].content = [{ type: 'video', data: videoUrl }];
                }
                return newMessages;
            });

        } catch (error) {
            console.error("Failed to generate initial video:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
             if (errorMessage.includes("API key error")) {
                setIsApiKeySelected(false);
             }
            setMessages(prev => {
                const newMessages = [...prev];
                const msgIndex = newMessages.findIndex(m => m.id === loadingMessageId);
                if (msgIndex > -1) {
                     newMessages[msgIndex].content = [{ type: 'error', data: `Failed to generate demo video. ${errorMessage}` }];
                }
                return newMessages;
            });
        }
    };

    generateInitialVideo();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setIsApiKeySelected(true); 
    }
  };

  // FIX: Wrap addMessage in useCallback for stable reference
  const addMessage = useCallback((role: MessageRole, content: MessageContent[], sources?: GroundingSource[]) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, sources }]);
  }, []);
  
  const updateLastMessage = (content: MessageContent[], sources?: GroundingSource[]) => {
    setMessages(prev => {
        if (prev.length === 0) return prev;
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.content = content;
        if(sources) lastMsg.sources = sources;
        return newMessages;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const tempMessageId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempMessageId, role: MessageRole.MODEL, content: [{type: 'loading', data: 'Processing files...'}] }]);

    const newFiles: UploadedFile[] = [];
    const errorMessages: string[] = [];
    
    // FIX: Explicitly cast the iterable of files to `File[]` to provide the correct type for the `file`
    // variable in the loop, resolving multiple 'property does not exist on type unknown' errors.
    for (const file of Array.from(files) as File[]) {
      try {
        const fileType = file.type;
        if (fileType.startsWith('image/')) {
            const base64 = await fileToBase64(file);
            newFiles.push({ base64, mimeType: fileType, name: file.name, type: 'image' });
        } else if (fileType.startsWith('audio/')) {
            const base64 = await fileToBase64(file);
            newFiles.push({ base64, mimeType: fileType, name: file.name, type: 'audio' });
        } else if (fileType.startsWith('video/')) {
            const base64 = await fileToBase64(file);
            newFiles.push({ base64, mimeType: fileType, name: file.name, type: 'video' });
        } else if (fileType === 'application/pdf' && typeof pdfjsLib !== 'undefined') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let j = 1; j <= pdf.numPages; j++) {
                const page = await pdf.getPage(j);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n';
            }
            newFiles.push({ textContent: fullText, mimeType: fileType, name: file.name, type: 'document' });
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && typeof mammoth !== 'undefined') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            newFiles.push({ textContent: result.value, mimeType: fileType, name: file.name, type: 'document' });
        } else if (fileType.startsWith('text/')) {
            const textContent = await file.text();
            newFiles.push({ textContent, mimeType: fileType, name: file.name, type: 'document' });
        } else {
           errorMessages.push(`File type "${fileType}" for "${file.name}" is not supported.`);
        }
      } catch (err) {
          console.error(`Error processing file ${file.name}:`, err);
          errorMessages.push(`Failed to process file "${file.name}".`);
      }
    }

    setMessages(prev => prev.filter(m => m.id !== tempMessageId));

    if (errorMessages.length > 0) {
        addMessage(MessageRole.MODEL, [{ type: 'error', data: errorMessages.join('\n') }]);
    }

    if (newFiles.length > 0) {
        setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    
    if (event.target) {
        event.target.value = '';
    }
  };
  
    const handleSpeak = async (text: string) => {
        try {
            // FIX: Handle raw PCM audio data from textToSpeech as per guidelines
            const base64Audio = await GeminiService.textToSpeech(text);
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1
            );
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start();
        } catch (error) {
            console.error("TTS Error:", error);
            addMessage(MessageRole.MODEL, [{ type: 'error', data: "Failed to generate audio." }]);
        }
    };

    const handleLiveMessage = useCallback(async (message: LiveServerMessage) => {
        // FIX: Handle transcription with stale-state-safe logic and add audio playback
        const isTurnComplete = !!message.serverContent?.turnComplete;
        
        const currentInput = message.serverContent?.inputTranscription?.text || '';
        const currentOutput = message.serverContent?.outputTranscription?.text || '';

        if (currentInput || currentOutput) {
            setLiveTranscription(prev => {
                const fullInput = prev.userInput + currentInput;
                const fullOutput = prev.modelInput + currentOutput;
    
                if (isTurnComplete) {
                    if (fullInput) addMessage(MessageRole.USER, [{type: 'text', data: fullInput}]);
                    if (fullOutput) addMessage(MessageRole.MODEL, [{type: 'text', data: fullOutput}]);
                    return {userInput: '', modelInput: ''};
                }
    
                return { userInput: fullInput, modelInput: fullOutput };
            });
        }

        // Handle audio output as required by guidelines
        const base64EncodedAudioString =
            message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
        if (base64EncodedAudioString) {
            nextStartTime = Math.max(
                nextStartTime,
                outputAudioContext.currentTime,
            );
            const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputAudioContext,
                24000,
                1,
            );
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.addEventListener('ended', () => {
                sources.delete(source);
            });

            source.start(nextStartTime);
            nextStartTime = nextStartTime + audioBuffer.duration;
            sources.add(source);
        }

        const interrupted = message.serverContent?.interrupted;
        if (interrupted) {
            for (const source of sources.values()) {
                source.stop();
                sources.delete(source);
            }
            nextStartTime = 0;
        }
    }, [addMessage]);
    
    const toggleRecording = async () => {
        if (isRecording) {
            setIsRecording(false);
            scriptProcessor?.disconnect();
            mediaStreamSource?.disconnect();
            liveSessionManager.close();
            audioContext.suspend();
        } else {
            try {
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamSource = audioContext.createMediaStreamSource(stream);
                scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    liveSessionManager.send(inputData);
                };
                
                mediaStreamSource.connect(scriptProcessor);
                scriptProcessor.connect(audioContext.destination);

                await liveSessionManager.connect({
                    onOpen: () => setIsRecording(true),
                    onMessage: handleLiveMessage,
                    onError: (e) => {
                        addMessage(MessageRole.MODEL, [{type: 'error', data: 'Live connection error.'}]);
                        console.error(e);
                        setIsRecording(false);
                    },
                    onClose: () => {
                        setIsRecording(false);
                        stream.getTracks().forEach(track => track.stop());
                    },
                });

            } catch (error) {
                console.error("Error starting recording:", error);
                addMessage(MessageRole.MODEL, [{ type: 'error', data: "Could not start microphone." }]);
            }
        }
    };

    const stopScreenRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScreenRecording(false);
    }, []);

    const startScreenRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" } as any, // Cast to any to avoid TS errors on some setups
                audio: true,
            });
            streamRef.current = stream;
            setIsScreenRecording(true);
            
            const recordedChunks: Blob[] = [];
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoFile = new File([videoBlob], `screen-recording-${Date.now()}.webm`, { type: 'video/webm' });

                try {
                    const base64 = await fileToBase64(videoFile);
                    setUploadedFiles(prev => [...prev, { name: videoFile.name, mimeType: videoFile.type, type: 'video', base64 }]);
                } catch (error) {
                    console.error("Error converting blob to base64:", error);
                    addMessage(MessageRole.MODEL, [{ type: 'error', data: "Failed to process screen recording." }]);
                }
                
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
                setIsScreenRecording(false);
            };

            mediaRecorder.start();

            stream.getVideoTracks()[0].addEventListener('ended', () => {
                stopScreenRecording();
            });

        } catch (error) {
            console.error("Error starting screen recording:", error);
            addMessage(MessageRole.MODEL, [{ type: 'error', data: "Could not start screen recording. Please grant permission." }]);
            setIsScreenRecording(false);
        }
    }, [addMessage, stopScreenRecording]);

    const toggleScreenRecording = useCallback(() => {
        if (isScreenRecording) {
            stopScreenRecording();
        } else {
            startScreenRecording();
        }
    }, [isScreenRecording, startScreenRecording, stopScreenRecording]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && uploadedFiles.length === 0) && !(mode === AppMode.VIDEO && useVideoDemoMode)) return;


    // --- Prepare content for displaying in the chat UI ---
    const userDisplayContent: MessageContent[] = [];
    if(input.trim()){
      userDisplayContent.push({ type: 'text', data: input });
    } else if (mode === AppMode.VIDEO && useVideoDemoMode) {
      userDisplayContent.push({ type: 'text', data: 'Generate a demo video.' });
    }
    uploadedFiles.forEach(file => {
        if (file.base64 && (file.type === 'image' || file.type === 'video' || file.type === 'audio')) {
            userDisplayContent.push({ type: file.type, data: `data:${file.mimeType};base64,${file.base64}`, mimeType: file.mimeType });
        } else {
            userDisplayContent.push({ type: 'text', data: `📄 Attached: ${file.name}` });
        }
    });
    addMessage(MessageRole.USER, userDisplayContent);
    
    // --- Prepare content for the API call ---
    let combinedPrompt = input;
    const textFiles = uploadedFiles.filter(f => f.textContent);
    if (textFiles.length > 0) {
        const fileContents = textFiles.map(file => 
            `Content of file "${file.name}":\n---\n${file.textContent || ''}\n---`
        ).join('\n\n');
        combinedPrompt = `${fileContents}\n\nBased on the above file(s), respond to this request: ${input}`;
    }
    
    const mediaFiles = uploadedFiles.filter(f => f.base64);

    setInput('');
    setUploadedFiles([]);
    setIsLoading(true);

    const getLoadingMessage = (): MessageContent => {
        switch(mode) {
            case AppMode.IMAGE:
                return { type: 'loading', data: 'Generating image...', expectedType: 'image' };
            case AppMode.VIDEO:
                return { type: 'loading', data: 'Initializing video...', expectedType: 'video' };
            case AppMode.CHAT:
            case AppMode.SCREEN_REC:
            default:
                return { type: 'loading', data: 'جار التفكير...', expectedType: 'text' };
        }
    }
    addMessage(MessageRole.MODEL, [getLoadingMessage()]);

    try {
        switch(mode) {
            case AppMode.IMAGE:
                if (mediaFiles.length > 0 && mediaFiles[0].type === 'image') {
                    const resultBase64 = await GeminiService.editImage(combinedPrompt, mediaFiles[0]);
                    updateLastMessage([{ type: 'image', data: resultBase64, mimeType: 'image/jpeg' }]);
                } else {
                    const resultBase64 = await GeminiService.generateImage(combinedPrompt, imageAspectRatio);
                    updateLastMessage([{ type: 'image', data: resultBase64, mimeType: 'image/jpeg' }]);
                }
                break;
            
            case AppMode.VIDEO:
                const hasKey = await checkApiKey();
                if (!hasKey) {
                    updateLastMessage([{ type: 'error', data: 'يرجى تحديد مفتاح API الخاص بك لإنشاء مقاطع الفيديو. يمكنك العثور على معلومات الفواتير على ai.google.dev/gemini-api/docs/billing' }]);
                    return;
                }
                
                let videoPromptFromUser = combinedPrompt;
                let imageForVideo = mediaFiles.find(f => f.type === 'image') || null;
                const audioForVideo = mediaFiles.find(f => f.type === 'audio');

                if(audioForVideo && !videoPromptFromUser) {
                     updateLastMessage([{ type: 'loading', data: 'تحويل الصوت إلى نص...', expectedType: 'video' }]);
                     videoPromptFromUser = await GeminiService.transcribeAudio(audioForVideo);
                }
                
                const finalVideoPrompt = useVideoDemoMode
                    ? (imageForVideo ? "Animate this image beautifully for 5 seconds." : "A beautiful, short, 5-second video of a mountain landscape at sunrise.")
                    : videoPromptFromUser;

                await GeminiService.generateVideo(finalVideoPrompt, imageForVideo, (progressMessage) => {
                    updateLastMessage([{ type: 'loading', data: progressMessage, expectedType: 'video' }]);
                }).then(videoUrl => {
                    updateLastMessage([{ type: 'video', data: videoUrl }]);
                });
                break;
            
            case AppMode.SCREEN_REC: // Fallthrough to chat for processing
            case AppMode.CHAT:
            default:
                const tools: any[] = [];
                if (useGoogleSearch) tools.push({ googleSearch: {} });
                if (useGoogleMaps) tools.push({ googleMaps: {} });
                
                const model = useThinkingMode ? 'gemini-2.5-pro' : (useFastMode ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash');
                const thinkingBudget = useThinkingMode ? 32768 : undefined;
                
                const response = await GeminiService.generateChatContent(combinedPrompt, mediaFiles, tools, model, thinkingBudget);
                
                const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                const sources: GroundingSource[] = groundingChunks
                    ?.map((chunk: any) => ({
                        uri: chunk.web?.uri || chunk.maps?.uri,
                        title: chunk.web?.title || chunk.maps?.title
                    }))
                    .filter((source: GroundingSource) => source.uri);

                updateLastMessage([{ type: 'text', data: response.text }], sources);
                break;
        }

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        if (errorMessage.includes("API key error")) {
           setIsApiKeySelected(false);
        }
        updateLastMessage([{ type: 'error', data: errorMessage }]);
    } finally {
        setIsLoading(false);
    }
  };
  
    const ModeButton = ({ thisMode, icon, label }: { thisMode: AppMode, icon: React.ReactNode, label: string }) => (
        <button
            onClick={() => setMode(thisMode)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-24 ${mode === thisMode ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
        {!isApiKeySelected && (
            <div className="bg-yellow-900 text-center p-2 text-sm text-yellow-100">
                <span>ميزة إنشاء الفيديو تتطلب مفتاح API.</span>
                <button onClick={handleSelectApiKey} className="underline font-bold mx-2">حدد مفتاح API</button>
                <span>للمتابعة.</span>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline ml-2">معلومات الفواتير</a>
            </div>
        )}
      <header className="p-4 border-b border-gray-700 shadow-md">
        <h1 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          AI Assistant Pro
        </h1>
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
            <ModeButton thisMode={AppMode.CHAT} icon={<ChatIcon className="w-6 h-6"/>} label="دردشة"/>
            <ModeButton thisMode={AppMode.IMAGE} icon={<ImageIcon className="w-6 h-6"/>} label="صور"/>
            <ModeButton thisMode={AppMode.VIDEO} icon={<VideoSparkIcon className="w-6 h-6"/>} label="فيديو"/>
            <ModeButton thisMode={AppMode.SCREEN_REC} icon={<ScreenRecIcon className="w-6 h-6"/>} label="تسجيل الشاشة"/>
            <ModeButton thisMode={AppMode.LIVE} icon={<AudioSparkIcon className="w-6 h-6"/>} label="مباشر"/>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} onSpeak={handleSpeak} />
          ))}
          { mode === AppMode.LIVE && isRecording && (
            <div className="text-center p-4 text-gray-400">
                <p><strong>أنت:</strong> {liveTranscription.userInput}</p>
                <p><strong>النموذج:</strong> {liveTranscription.modelInput}</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t border-gray-700 bg-gray-900">
        <div className="max-w-4xl mx-auto">
             { mode === AppMode.CHAT &&
                 <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={useGoogleSearch} onChange={e => setUseGoogleSearch(e.target.checked)} className="form-checkbox bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"/>
                        <GoogleIcon className="w-5 h-5" /> بحث Google
                    </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={useGoogleMaps} onChange={e => setUseGoogleMaps(e.target.checked)} className="form-checkbox bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"/>
                        <GoogleIcon className="w-5 h-5" /> خرائط Google
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={useThinkingMode} onChange={e => setUseThinkingMode(e.target.checked)} className="form-checkbox bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"/>
                         <SparkIcon className="w-5 h-5 text-purple-400" /> وضع التفكير
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={useFastMode} onChange={e => setUseFastMode(e.target.checked)} className="form-checkbox bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"/>
                         ⚡️ الوضع السريع
                    </label>
                </div>
             }
             { mode === AppMode.IMAGE &&
                <div className="text-center mb-2">
                    <label className="text-sm mr-2">نسبة الأبعاد:</label>
                    <select value={imageAspectRatio} onChange={e => setImageAspectRatio(e.target.value as AspectRatio)} className="bg-gray-700 border border-gray-600 rounded-md p-1 text-sm">
                        <option value="1:1">مربع (1:1)</option>
                        <option value="16:9">أفقي (16:9)</option>
                        <option value="9:16">عمودي (9:16)</option>
                        <option value="4:3">منظر طبيعي (4:3)</option>
                        <option value="3:4">صورة شخصية (3:4)</option>
                    </select>
                </div>
             }
             { mode === AppMode.VIDEO &&
                <div className="flex flex-col items-center mb-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400" title="الوضع التجريبي يحاكي تجربة مجانية عن طريق إنشاء مقطع فيديو قصير ومحدد مسبقًا لعرض الوظيفة دون استخدام وصف مخصص.">
                        <input 
                            type="checkbox" 
                            checked={useVideoDemoMode} 
                            onChange={e => setUseVideoDemoMode(e.target.checked)} 
                            className="form-checkbox bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"
                        />
                        💡 استخدم الوضع التجريبي
                    </label>
                </div>
             }
            {uploadedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                        <div key={index} className="bg-gray-700 p-2 rounded-lg text-sm flex items-center gap-2">
                            <FileIcon fileType={file.type} className="w-5 h-5 text-gray-300" />
                            <span className="truncate max-w-xs">{file.name}</span>
                            <button onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-300">
                                &#x2715;
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            { mode === AppMode.LIVE ? (
                <div className="flex justify-center">
                    <button onClick={toggleRecording} disabled={isLoading} className={`p-4 rounded-full transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                        {isRecording ? <StopIcon className="w-8 h-8 text-white"/> : <MicIcon className="w-8 h-8 text-white"/>}
                    </button>
                </div>
            ) : (
                <>
                    {mode === AppMode.SCREEN_REC && (
                         <div className="text-center mb-3">
                            <button onClick={toggleScreenRecording} disabled={isLoading} className={`inline-flex items-center justify-center px-6 py-3 rounded-full transition-colors text-white font-bold ${isScreenRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                                {isScreenRecording ? <StopIcon className="w-6 h-6"/> : <ScreenRecIcon className="w-6 h-6"/>}
                                <span className="mx-2">{isScreenRecording ? 'إيقاف التسجيل' : 'بدء تسجيل الشاشة'}</span>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-800 rounded-full p-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept="image/*,video/*,audio/*,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"/>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700">
                            <PaperclipIcon className="w-6 h-6" />
                        </button>
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder={
                                (mode === AppMode.VIDEO && useVideoDemoMode) ? "الوضع التجريبي مفعل، اضغط إرسال للبدء" :
                                mode === AppMode.CHAT ? "اكتب رسالتك هنا..." :
                                mode === AppMode.IMAGE ? "اكتب وصفًا للصورة أو طلب تعديل..." :
                                mode === AppMode.VIDEO ? "اكتب وصفًا للفيديو..." :
                                "أضف وصفًا أو سؤالًا عن التسجيل..."
                            } 
                            className="flex-1 bg-transparent focus:outline-none px-4 text-white placeholder-gray-500" 
                            disabled={isLoading || (mode === AppMode.VIDEO && useVideoDemoMode)}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || ((mode !== AppMode.VIDEO || !useVideoDemoMode) && !input.trim() && uploadedFiles.length === 0)} 
                            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </form>
                </>
            )}
        </div>
      </footer>
    </div>
  );
}