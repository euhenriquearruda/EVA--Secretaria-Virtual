
import { GoogleGenAI, Modality } from '@google/genai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getEvaResponse, SYSTEM_INSTRUCTION, criar_tarefa, delegar_tarefa } from '../services/geminiService';
import { ChatMessage, Employee, Task, User } from '../types';

// Auxiliares de Áudio
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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

interface EvaChatProps {
  user: User;
  tasks: Task[];
  employees: Employee[];
  onTaskCreated?: (task: Task) => void;
}

const EvaChat = ({ user, tasks, employees, onTaskCreated }: EvaChatProps) => {
  const STORAGE_KEY = `eva_chat_history_${user.email}`;
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [
        { 
          role: 'model', 
          text: `Protocolo Alfa ativo. Sou sua inteligência estratégica. Como posso otimizar seu dia?`, 
          timestamp: Date.now() 
        }
      ];
    } catch {
      return [{ role: 'model', text: `EVA: Online.`, timestamp: Date.now() }];
    }
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper for capitalization
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, STORAGE_KEY]);

  const cleanText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\*/g, '')
      .replace(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+:\s*/, '')
      .trim();
  };

  const handleTaskCreation = useCallback((call: any) => {
    const args = call.args as any;
    let newTask: Task | null = null;
    
    if (call.name === 'criar_tarefa') {
      newTask = {
        id: Math.random().toString(36).substr(2, 9),
        title: args.title,
        category: 'work',
        status: 'pending',
        assignee: 'me',
        priority: args.priority || 'medium',
        deadline: args.deadline,
        time: args.time,
        location: args.location
      };
    } else if (call.name === 'delegar_tarefa') {
      newTask = {
        id: Math.random().toString(36).substr(2, 9),
        title: args.title,
        category: 'work',
        status: 'pending',
        assignee: capitalize(args.employee_name), // Aplica Capitalize no nome delegado
        priority: args.priority || 'medium',
        deadline: args.deadline,
        time: args.time,
        location: args.location
      };
    }

    if (newTask) {
      if (onTaskCreated) onTaskCreated(newTask);
      return "Sucesso.";
    }
    return "Erro.";
  }, [onTaskCreated]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: Date.now() }]);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await getEvaResponse(userText, history, employees, tasks);
      
      let feedback = "";
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          handleTaskCreation(fc);
          const args = fc.args as any;
          if (fc.name === 'delegar_tarefa') {
             feedback += `\n\n📡 **TRANSMISSÃO**\nDestinatário: ${capitalize(args.employee_name)}\nTarefa: "${args.title}"`;
          } else {
             feedback += `\n\n📅 **AGENDA**\n"${args.title}" adicionado à sua rotina.`;
          }
        }
      }

      const modelText = response.text || "";
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: cleanText(modelText) + feedback, 
        timestamp: Date.now() 
      }]);
    } catch (error) {
      console.error("EVA Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "Falha no protocolo. Tente novamente.", 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const stopLiveSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    activeSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    activeSourcesRef.current.clear();
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (outAudioContextRef.current) {
      outAudioContextRef.current.close().catch(() => {});
      outAudioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;
    setIsLive(false);
    setIsConnecting(false);
  }, []);

  const startLiveSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            setIsConnecting(false);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s?.sendRealtimeInput({
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
              }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outAudioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outAudioContextRef.current, 24000, 1);
              const source = outAudioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outAudioContextRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSourcesRef.current.add(source);
            }
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                const result = handleTaskCreation(fc);
                sessionPromise.then(s => s.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { result } }
                }));
              }
            }
          },
          onclose: () => stopLiveSession(),
          onerror: () => stopLiveSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION.replace('{TEAM_LIST}', employees.map(e => `${e.name} (${e.role})`).join(', ') || 'Ninguém'),
          tools: [{ functionDeclarations: [criar_tarefa, delegar_tarefa] }]
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      stopLiveSession();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1a] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] pointer-events-none"></div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-12 py-4 space-y-8 relative z-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 pb-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}>
              <div className={`max-w-[95%] sm:max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] shadow-xl ${msg.role === 'user' ? 'bg-white/5 border border-white/10 text-slate-500' : 'eva-gradient text-white'}`}>
                  <i className={`fas ${msg.role === 'user' ? 'fa-user' : 'fa-bolt'}`}></i>
                </div>
                <div className={`p-4 md:p-5 rounded-2xl shadow-xl text-[13px] md:text-sm leading-relaxed font-medium transition-all ${msg.role === 'user' ? 'bg-white/5 text-slate-200 rounded-tr-none border border-white/10' : 'bg-[#111827]/60 text-slate-100 border border-white/5 rounded-tl-none backdrop-blur-md'}`}>
                  <div className="whitespace-pre-wrap text-slate-200">{msg.text}</div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg eva-gradient flex items-center justify-center animate-pulse"><i className="fas fa-brain text-white text-[10px]"></i></div>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 md:px-12 pb-6 pt-2 bg-[#0a0f1a]/80 backdrop-blur-2xl border-t border-white/5 relative z-20">
        <div className="max-w-4xl mx-auto flex items-center gap-2 md:gap-4 relative">
          <button 
            type="button"
            disabled={isLoading}
            onClick={isLive ? stopLiveSession : startLiveSession}
            className={`shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isLive ? 'bg-rose-500' : isConnecting ? 'bg-amber-500 animate-pulse' : 'bg-blue-600'
            } disabled:opacity-50`}
          >
            <i className={`fas ${isLive ? 'fa-stop' : isConnecting ? 'fa-sync-alt fa-spin' : 'fa-microphone-lines'} text-white text-sm`}></i>
          </button>

          <form onSubmit={handleSendText} className="flex-1 relative group">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isLive}
              placeholder={isLive ? "EVA está ouvindo..." : "O que faremos hoje?"}
              className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[1.5rem] px-5 md:px-8 py-4 md:py-5 outline-none text-sm font-bold text-white focus:border-blue-500/40 transition-all placeholder:text-slate-700 disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading || isLive}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-xl eva-gradient text-white flex items-center justify-center transition-all disabled:opacity-0 scale-90"
            >
              <i className="fas fa-arrow-up text-xs"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EvaChat;
