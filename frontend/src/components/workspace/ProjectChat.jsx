import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { getSocket } from '../../services/socket';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatRelativeTime } from '../../utils/formatters';
import {
  Send,
  MessageSquare,
  User,
  Building2,
  Sparkles,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';

export const ProjectChat = ({ project }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch initial message history via REST
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await chatService.getProjectMessages(project._id);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to load message history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [project._id]);

  // Scroll on messages update
  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  // 2. Real-Time Socket.IO connection & event handlers
  useEffect(() => {
    const socket = getSocket();

    // Join this specific project workspace room
    socket.emit('join_project', { projectId: project._id });

    // Listener for incoming real-time messages
    const handleNewMessage = ({ projectId, message }) => {
      if (projectId === project._id) {
        setMessages((prev) => {
          // Avoid duplicate insertion if sender already received echo
          if (prev.some((m) => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    // Listener for typing indicator
    const handleUserTyping = ({ userId, userName, isTyping }) => {
      if (userId !== user._id) {
        if (isTyping) {
          setTypingUser(userName);
        } else {
          setTypingUser(null);
        }
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.emit('leave_project', { projectId: project._id });
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [project._id, user._id]);

  // Send message handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || sending) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const socket = getSocket();

      if (socket && socket.connected) {
        // Send via real-time WebSocket
        socket.emit('send_message', {
          projectId: project._id,
          content,
        });
      } else {
        // Fallback to REST endpoint
        const res = await chatService.sendMessage(project._id, content);
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  // Typing event emission
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('typing', { projectId: project._id, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { projectId: project._id, isTyping: false });
      }, 1500);
    }
  };

  const otherParticipantName =
    user?.role === 'client'
      ? project.hiredFreelancer?.name || 'Freelancer'
      : project.client?.name || 'Client';

  return (
    <div className="flex flex-col h-[650px] rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>{otherParticipantName}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-xs text-slate-400">
              Encrypted Real-Time Project Room • {project.title}
            </p>
          </div>
        </div>

        <Badge variant="brand" size="sm">
          <ShieldCheck className="w-3 h-3" /> Socket.IO Connected
        </Badge>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {loading ? (
          <LoadingSpinner text="Connecting to live chat stream..." />
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-200 text-sm">No messages yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Start the discussion regarding project architecture, milestones, or questions.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe =
              msg.sender?._id === user?._id ||
              msg.sender === user?._id ||
              (typeof msg.sender === 'object' && msg.sender?._id?.toString() === user?._id?.toString());

            return (
              <div
                key={msg._id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Name */}
                <span className="text-[11px] font-semibold text-slate-400 mb-1 px-1">
                  {isMe ? 'You' : msg.sender?.name || 'Participant'}
                </span>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/60'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{msg.content}</p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                  {formatRelativeTime(msg.createdAt)}
                  {isMe && <CheckCheck className="w-3 h-3 text-indigo-400" />}
                </span>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="text-xs text-indigo-400 italic flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            {typingUser} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Message ${otherParticipantName}...`}
            value={inputText}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={sending}
            disabled={!inputText.trim()}
            className="glow-indigo"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
