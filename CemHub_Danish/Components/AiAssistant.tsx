
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { Scenario } from '../types';
import { createChatSession } from '../services/geminiService';
import type { Chat, Part, GenerateContentResponse } from '@google/genai';
import type { AgentBot } from './AiOperationalInsight';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    attachment?: {
        name: string;
        data: string; // base64 data URL
        mimeType: string;
    };
}

interface AiAssistantProps {
    scenario: Scenario;
    pageMode?: boolean;
    selectedBots?: AgentBot[];
}

interface ChatSession {
    id: string;
    name: string;
    chat: Chat | null;
    history: ChatMessage[];
    bots: AgentBot[];
}

// Fix: Update all icon components to accept and forward SVG props
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"} {...props}><path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l.645 1.546a.75.75 0 0 0 .705.498h1.642c.812 0 1.158.995.565 1.549l-1.321.96a.75.75 0 0 0-.272.824l.645 1.546c.321.772-.535 1.549-1.281 1.05l-1.321-.96a.75.75 0 0 0-.858 0l-1.321.96c-.746.5-1.602-.278-1.281-1.05l.645-1.546a.75.75 0 0 0-.272-.824l-1.321-.96c-.593-.554-.247-1.549.565-1.549h1.642a.75.75 0 0 0 .705-.498l.645-1.546z" clipRule="evenodd" /></svg>
);

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"} {...props}><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" /></svg>
);

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"} {...props}><path d="M3.105 3.105a.75.75 0 0 1 .814-.156L16.75 8.25a.75.75 0 0 1 0 1.5L3.92 15.05a.75.75 0 0 1-1.022-1.022L4.939 10 2.893 7.953A.75.75 0 0 1 3.105 3.105Z" /></svg>
);

const NewChatIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);

const ExpandIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
);

const CollapseIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>
);

// FIX: Updated component to accept a `title` prop and render an SVG `<title>` element for accessibility and tooltips.
const PencilIcon: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }> = ({className, title, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

// FIX: Updated component to accept a `title` prop and render an SVG `<title>` element for accessibility and tooltips.
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }> = ({className, title, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" /></svg>
);

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 7.5v-1.5a6 6 0 0 0-6-6v-1.5a6 6 0 0 0-6 6v1.5m6 7.5h.008v.008H12v-.008Z" /></svg>
);

const StopCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.563C9.252 15 9 14.748 9 14.437V9.563Z" /></svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({className, ...props}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"} {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const AiAssistant: React.FC<AiAssistantProps> = ({ scenario, pageMode = false, selectedBots = [] }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
    const [tempSessionName, setTempSessionName] = useState('');
    const [isSessionSwitcherOpen, setIsSessionSwitcherOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [attachedFile, setAttachedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    const activeSession = sessions.find(s => s.id === activeSessionId);
    const isFullView = isFullScreen || pageMode;

    const addNewSession = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const chatInstance = await createChatSession(scenario, selectedBots);
            const newSessionId = `session_${Date.now()}`;
            
            const existingSessionNumbers = sessions
                .map(s => {
                    const match = s.name.match(/^Session (\d+)$/);
                    return match ? parseInt(match[1], 10) : 0;
                })
                .filter(n => n > 0);
            
            const nextSessionNumber = existingSessionNumbers.length > 0 ? Math.max(...existingSessionNumbers) + 1 : 1;

            const botNames = selectedBots.map(b => b.name);
            let initialMessage;
            if (botNames.length === 0) {
                 initialMessage = 'Hello! I am CemHub. Ask me to compare wagon types, analyze costs, or evaluate the ESG impact for this scenario.';
            } else if (botNames.length === 1) {
                initialMessage = `Hello! I am CemHub, assisted by ${botNames[0]}. How can I help you analyze this scenario?`;
            } else {
                const lastBot = botNames.pop();
                initialMessage = `Hello! I am CemHub, assisted by ${botNames.join(', ')} and ${lastBot}. How can I help you analyze this scenario?`;
            }

            const newSession: ChatSession = {
                id: newSessionId,
                name: `Session ${nextSessionNumber}`,
                chat: chatInstance,
                history: [ { role: 'model', text: initialMessage } ],
                bots: selectedBots,
            };
            setSessions(prev => [...prev, newSession]);
            setActiveSessionId(newSessionId);
        } catch (err) {
            setError('Failed to create a new session.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [scenario, sessions, selectedBots]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [activeSession?.history, isLoading]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSessionSwitcherOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        // Cleanup speech recognition on component unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const handleDeleteSession = (sessionIdToDelete: string) => {
        if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            setSessions(prevSessions => {
                const updatedSessions = prevSessions.filter(s => s.id !== sessionIdToDelete);
                if (activeSessionId === sessionIdToDelete) {
                    setActiveSessionId(updatedSessions[0]?.id || null);
                }
                return updatedSessions;
            });
        }
    };

    // This effect is responsible for creating the very first session or
    // creating a new one if all sessions have been deleted.
    useEffect(() => {
        if (!isLoading && sessions.length === 0) {
            addNewSession();
        }
    }, [sessions.length, isLoading, addNewSession]);

    // This effect is responsible for resetting the chat when the scenario changes.
    const isInitialMount = useRef(true);
    const prevScenarioId = useRef(scenario.id);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (scenario.id !== prevScenarioId.current) {
            setSessions([]);
            setActiveSessionId(null);
        }

        // Update refs for the next comparison
        prevScenarioId.current = scenario.id;

    }, [scenario]);

    const handleSendMessage = useCallback(async () => {
        if ((!prompt.trim() && !attachedFile) || !activeSessionId || isLoading || !activeSession?.chat) return;

        const userMessageText = prompt.trim();
        const userMessageForHistory: ChatMessage = {
            role: 'user' as const,
            text: userMessageText,
            attachment: attachedFile ? { name: attachedFile.name, data: attachedFile.data, mimeType: attachedFile.mimeType } : undefined,
        };

        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, userMessageForHistory] } : s));
        setPrompt('');
        setAttachedFile(null);
        setIsLoading(true);
        setError('');

        try {
            const parts: Part[] = [];
            if (userMessageText) {
                parts.push({ text: userMessageText });
            }
            if (attachedFile) {
                // Remove data URL prefix before sending to API
                const base64Data = attachedFile.data.split(',')[1];
                parts.push({
                    inlineData: {
                        mimeType: attachedFile.mimeType,
                        data: base64Data
                    }
                });
            }

            // Directly use the chat session to send a multipart message
            // FIX: Corrected the payload for `chat.sendMessage` to use `message` property with parts array.
            const response: GenerateContentResponse = await activeSession.chat.sendMessage({ message: parts });

            const modelMessage: ChatMessage = { 
                role: 'model' as const, 
                text: response.text,
            };

            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [...s.history, modelMessage] } : s));
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: s.history.slice(0, -1) } : s));
        } finally {
            setIsLoading(false);
        }
    }, [prompt, attachedFile, activeSession, activeSessionId, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    const handleStartRename = (id: string, name: string) => {
        setRenamingSessionId(id);
        setTempSessionName(name);
    };

    const handleConfirmRename = () => {
        if (renamingSessionId && tempSessionName.trim()) {
            setSessions(sessions.map(s => s.id === renamingSessionId ? { ...s, name: tempSessionName.trim() } : s));
        }
        setRenamingSessionId(null);
        setTempSessionName('');
    };
    
    const filteredSessions = useMemo(() => {
        if (!searchQuery.trim()) {
            return sessions;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return sessions.filter(session => {
            const inName = session.name.toLowerCase().includes(lowercasedQuery);
            const inHistory = session.history.some(msg => 
                msg.text.toLowerCase().includes(lowercasedQuery)
            );
            return inName || inHistory;
        });
    }, [sessions, searchQuery]);

    const handleFileButtonClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAttachedFile({
                    name: file.name,
                    data: e.target?.result as string,
                    mimeType: file.type,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            if (!SpeechRecognition) {
                setError("Speech recognition is not supported in your browser.");
                return;
            }
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                // To avoid duplication, we'll just set the prompt to the latest transcript
                // You could also append: setPrompt(p => p + finalTranscript)
                setPrompt(p => p + finalTranscript);
            };
            recognition.onend = () => setIsRecording(false);
            recognition.onerror = (event: any) => {
                setError(`Speech recognition error: ${event.error}`);
                setIsRecording(false);
            };
            recognition.start();
            recognitionRef.current = recognition;
            setIsRecording(true);
        }
    };

    return (
        <>
            {!pageMode && isFullScreen && <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsFullScreen(false)}></div>}
            <div className={`transition-all duration-300 ease-in-out flex flex-col bg-white border border-gray-200 rounded-lg ${
                pageMode 
                ? 'w-full h-full' 
                : isFullScreen 
                ? 'fixed inset-4 md:inset-12 lg:inset-20 z-50' 
                : 'h-[450px]'
            }`}>
                <div className="flex w-full h-full overflow-hidden">
                    {/* Session Sidebar */}
                    {isFullView && (
                        <div className="flex flex-col w-2/5 max-w-[240px] sm:w-1/3 sm:max-w-[200px] bg-gray-50/50 p-2 border-r border-gray-200">
                            <div className="flex justify-between items-center mb-3 flex-shrink-0">
                                <h3 className="text-sm font-semibold text-gray-700 px-1">Sessions</h3>
                                <button onClick={addNewSession} className='p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors' title="Start New Chat" disabled={isLoading} >
                                    <NewChatIcon className="h-5 w-5" />
                                </button>
                            </div>
                             <div className="relative mb-3 flex-shrink-0">
                                <input
                                    type="text"
                                    placeholder="Search sessions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-100 border border-gray-300 rounded-md py-1.5 pl-8 pr-2 text-sm text-gray-800 focus:ring-1 focus:ring-green-500 focus:outline-none"
                                />
                                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            </div>
                            <ul className="flex-grow overflow-y-auto pr-1 space-y-1">
                                {filteredSessions.map(session => (
                                    <li key={session.id}>
                                        {renamingSessionId === session.id ? (
                                            <div className="flex items-center bg-gray-100 rounded-md">
                                                <input type="text" value={tempSessionName} onChange={(e) => setTempSessionName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()} className="w-full bg-transparent text-sm p-1.5 text-gray-800 focus:outline-none" autoFocus />
                                                <button onClick={handleConfirmRename} className="p-1 text-green-600 hover:bg-gray-300 rounded-md"><CheckIcon className="h-4 w-4" /></button>
                                                <button onClick={() => setRenamingSessionId(null)} className="p-1 text-red-600 hover:bg-gray-300 rounded-md mr-1"><XIcon className="h-4 w-4" /></button>
                                            </div>
                                        ) : (
                                        <button onClick={() => setActiveSessionId(session.id)} className={`w-full text-left flex justify-between items-center p-1.5 text-sm rounded-md transition-colors group ${activeSessionId === session.id ? 'bg-green-600/80 text-white' : 'text-gray-700 hover:bg-gray-200'}`} >
                                            <span className="truncate">{session.name}</span>
                                            <div className="flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <PencilIcon onClick={(e) => { e.stopPropagation(); handleStartRename(session.id, session.name); }} className="h-4 w-4 ml-2 text-gray-500 hover:text-gray-800" title="Rename Session"/>
                                                <TrashIcon onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }} className="h-4 w-4 ml-1 text-gray-500 hover:text-red-600" title="Delete Session"/>
                                            </div>
                                        </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Main Chat Area */}
                    <div className="flex flex-col flex-1 p-3">
                        <div className="flex justify-between items-center mb-3 flex-shrink-0">
                            {isFullView ? (
                                <div className="flex items-center min-w-0">
                                    <SparklesIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                                    <h2 className="text-lg font-semibold text-green-700 ml-2 truncate">{activeSession?.name || 'AI Assistant'}</h2>
                                    <div className="flex items-center space-x-1 ml-3 border-l border-gray-200 pl-3">
                                        {activeSession?.bots.map(bot => (
                                            // FIX: The type of `bot.icon` is now correctly specified in the `AgentBot` interface, resolving the TypeScript error with `React.cloneElement`.
                                            <div key={bot.id} className="text-gray-500" title={bot.name}>
                                                {React.cloneElement(bot.icon, { className: "w-5 h-5" })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative flex-grow mr-2" ref={dropdownRef}>
                                    <button onClick={() => setIsSessionSwitcherOpen(!isSessionSwitcherOpen)} className="flex items-center justify-between w-full px-2 py-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-left">
                                        <div className="flex items-center truncate">
                                            <SparklesIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                                            <span className="text-sm font-semibold text-gray-800 ml-2 truncate">{activeSession?.name || 'Select Session'}</span>
                                            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                                {activeSession?.bots.slice(0, 2).map(bot => (
                                                    // FIX: The type of `bot.icon` is now correctly specified in the `AgentBot` interface, resolving the TypeScript error with `React.cloneElement`.
                                                    <div key={bot.id} className="text-gray-500" title={bot.name}>
                                                        {React.cloneElement(bot.icon, { className: "w-4 h-4" })}
                                                    </div>
                                                ))}
                                                {activeSession && activeSession.bots.length > 2 && (
                                                    <div className="text-gray-500 text-xs font-mono">+{activeSession.bots.length - 2}</div>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${isSessionSwitcherOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isSessionSwitcherOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                            <ul>
                                                {sessions.map(session => (
                                                    <li key={session.id}>
                                                        <button onClick={() => { setActiveSessionId(session.id); setIsSessionSwitcherOpen(false); }} className={`w-full text-left p-2 text-sm truncate ${activeSessionId === session.id ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`} >
                                                            {session.name}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                             <div className="flex items-center flex-shrink-0">
                                {!isFullView && (
                                    <button onClick={addNewSession} className='p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors' title="Start New Chat" disabled={isLoading} >
                                        <NewChatIcon className="h-5 w-5" />
                                    </button>
                                )}
                                {!pageMode && (
                                    <button onClick={() => setIsFullScreen(!isFullScreen)} className='p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors ml-1' title={isFullScreen ? "Collapse" : "Expand"} >
                                       {isFullScreen ? <CollapseIcon className="h-5 w-5" /> : <ExpandIcon className="h-5 w-5" />}
                                    </button>
                                )}
                             </div>
                        </div>
                        
                        <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4 mb-3">
                            {activeSession?.history.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                   {msg.role === 'model' && (<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-green-600" /></div>)}
                                    <div className={`w-auto w-auto max-w-4xl rounded-lg p-3 text-sm leading-relaxed rounded-lg p-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-900 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                       {msg.attachment && (
                                            <div className="mb-2">
                                                <img src={msg.attachment.data} alt={msg.attachment.name} className="max-w-full h-auto rounded-md" />
                                            </div>
                                       )}
                                       {msg.text && (
                                            <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.role === 'model' ? msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : msg.text }} />
                                        )}
                                    </div>
                                    {msg.role === 'user' && (<div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-white" /></div>)}
                                </div>
                            ))}
                            {isLoading && (
                                 <div className="flex items-start gap-2.5 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-green-600" /></div>
                                    <div className="bg-gray-200 rounded-lg p-3 rounded-bl-none">
                                        <div className="flex items-center justify-center space-x-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                             {error && <p className="text-red-600 text-sm px-2">{error}</p>}
                        </div>

                        <div className="flex-shrink-0">
                            {attachedFile && (
                                <div className="px-3 py-2 bg-gray-100 rounded-t-lg flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-700 truncate">
                                        <PaperClipIcon className="h-4 w-4 flex-shrink-0"/>
                                        <span className="truncate">{attachedFile.name}</span>
                                    </div>
                                    <button onClick={() => setAttachedFile(null)} className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full"><XCircleIcon className="h-5 w-5" /></button>
                                </div>
                            )}
                            <div className="flex items-end bg-white border border-gray-300 rounded-lg p-2 gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />
                                <button onClick={handleFileButtonClick} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors" title="Attach File" aria-label="Attach File"><PaperClipIcon className="w-5 h-5"/></button>
                                <button onClick={handleToggleRecording} className={`p-2 rounded-md transition-colors ${isRecording ? 'text-red-500 bg-red-500/20' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`} title={isRecording ? 'Stop Recording' : 'Record Audio'} aria-label={isRecording ? 'Stop Recording' : 'Record Audio'}>
                                    {isRecording ? <StopCircleIcon className="w-5 h-5"/> : <MicrophoneIcon className="w-5 h-5"/>}
                                </button>
                                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown} rows={1} className="flex-grow bg-transparent p-1 text-gray-800 focus:outline-none resize-none max-h-24" placeholder="Ask a follow-up question..." disabled={isLoading || !activeSessionId} />
                                <button onClick={handleSendMessage} disabled={isLoading || (!prompt.trim() && !attachedFile) || !activeSessionId} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold p-2 rounded-md transition duration-300 flex items-center justify-center" aria-label="Send message" >
                                    <SendIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AiAssistant;