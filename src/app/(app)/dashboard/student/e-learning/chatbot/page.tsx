
"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Bot as BotIcon, Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { elearningChat, type ElearningChatInput } from '@/ai/flows/elearning-chat-flow';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

export default function ChatbotPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if(scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);
  
  useEffect(() => {
    // Add an initial greeting from the bot
    setMessages([
      {
        id: 'initial-greeting',
        sender: 'bot',
        text: 'Hello! I am your Chitechma University e-learning assistant. How can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatHistoryForFlow = messages.map(msg => ({ sender: msg.sender, text: msg.text }));
      
      const flowInput: ElearningChatInput = {
        query: userMessage.text,
        history: chatHistoryForFlow.slice(-10) // Send last 10 messages for context
      };
      const result = await elearningChat(flowInput);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: result.response,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling chatbot flow:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]" // Adjusted height calculation
    >
      <Card className="flex-grow flex flex-col shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <MessageSquare className="h-7 w-7 text-primary" />
            E-Learning AI Chatbot
          </CardTitle>
          <CardDescription>Ask questions about your courses, materials, or general e-learning topics.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-0 flex flex-col">
          <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex items-end gap-2 max-w-[85%] sm:max-w-[75%]",
                  message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                )}
              >
                <Avatar className={cn("h-8 w-8 shrink-0", message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground')}>
                  <AvatarImage src={message.sender === 'user' ? profile?.photoURL || undefined : undefined} alt={message.sender} />
                  <AvatarFallback>
                    {message.sender === 'user' ? getInitials(profile?.displayName) : <BotIcon className="h-5 w-5"/>}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg px-4 py-2.5 text-sm shadow",
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                   <p className={cn(
                      "text-xs mt-1 opacity-70",
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    )}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 mr-auto max-w-[75%]">
                 <Avatar className="h-8 w-8 shrink-0 bg-accent text-accent-foreground">
                    <AvatarFallback><BotIcon className="h-5 w-5"/></AvatarFallback>
                 </Avatar>
                 <div className="rounded-lg px-4 py-3 bg-muted text-foreground rounded-bl-none shadow">
                    <Loader2 className="h-5 w-5 animate-spin" />
                 </div>
              </div>
            )}
          </ScrollArea>
          <div className="border-t p-4 bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-grow"
                autoComplete="off"
              />
              <Button type="submit" disabled={isLoading || inputValue.trim() === ''} size="icon">
                <Send className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
