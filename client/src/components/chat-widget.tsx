import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat'],
    refetchInterval: isOpen ? 2000 : false, // Poll for new messages when open
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        content,
        isUser: true,
        timestamp: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat'] });
      setNewMessage("");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const unreadCount = messages.filter(msg => !msg.isUser).length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col mb-4">
          <div className="bg-primary text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-headset text-sm"></i>
              </div>
              <div>
                <h3 className="font-medium">Live Support</h3>
                <p className="text-xs opacity-90">We're online now</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white p-1"
              onClick={() => setIsOpen(false)}
              data-testid="button-close-chat"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3" data-testid="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isUser ? 'justify-end' : ''}`}
              >
                <div 
                  className={`rounded-lg p-3 max-w-xs ${
                    message.isUser 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}
                  data-testid={`message-${message.isUser ? 'user' : 'bot'}-${message.id}`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 text-sm"
                disabled={sendMessageMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button 
                type="submit"
                size="sm"
                className="bg-primary text-white hover:bg-primary-dark p-2"
                disabled={sendMessageMutation.isPending || !newMessage.trim()}
                data-testid="button-send-message"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </Button>
            </div>
          </form>
        </div>
      )}
      
      <Button
        className="bg-primary text-white w-14 h-14 rounded-full shadow-2xl hover:bg-primary-dark relative group"
        onClick={toggleChat}
        data-testid="button-toggle-chat"
      >
        {isOpen ? (
          <i className="fas fa-times text-xl group-hover:scale-110 transition-transform duration-300"></i>
        ) : (
          <i className="fas fa-comments text-xl group-hover:scale-110 transition-transform duration-300"></i>
        )}
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-danger text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>
    </div>
  );
}
