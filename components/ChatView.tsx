import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Send, Sparkles, Loader2, MapPin, Calendar, Clock, Plane, ChevronRight, X, ThumbsUp, ThumbsDown, Copy, RefreshCw } from 'lucide-react';
import { Message, Language } from '../types';
import { aiService } from '../services/ai';
import { translations } from '../locales';

export interface ChatViewHandle {
  clearMessages: () => void;
  setInputValue: (val: string) => void;
}

interface Suggestion {
  id: string;
  type: 'destination' | 'activity' | 'tip';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  data?: any;
}

interface ChatViewProps {
  isVisible: boolean;
  lang: Language;
  isWelcomeMode: boolean;
  onNewNeed?: (need: string) => void;
  onKeywordSelect?: (kw: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

const ChatView = forwardRef<ChatViewHandle, ChatViewProps>(({ isVisible, lang, isWelcomeMode, onNewNeed, onKeywordSelect, onClose, onOpen }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  // 快捷回复选项
  const defaultQuickReplies = useMemo(() => {
    if (lang === 'zh') {
      return [
        '推荐一些热门目的地',
        '帮我规划一个周末旅行',
        '有哪些适合家庭出游的地方',
        '推荐一些美食景点',
        '我想了解当地文化'
      ];
    } else {
      return [
        'Recommend popular destinations',
        'Plan a weekend trip for me',
        'Family-friendly places',
        'Best food attractions',
        'Learn about local culture'
      ];
    }
  }, [lang]);

  // 初始化快捷回复
  useEffect(() => {
    setQuickReplies(defaultQuickReplies);
  }, [defaultQuickReplies, lang]);

  useImperativeHandle(ref, () => ({
    clearMessages: () => {
      setMessages([]);
      setInput('');
      setIsLoading(false);
      setIsThinking(false);
    },
    setInputValue: (val: string) => {
      setInput(val);
    }
  }));

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isVisible]);

  // 生成AI建议
  const generateSuggestions = async (userMessage: string) => {
    try {
      // 模拟建议生成 - 实际可以使用AI来生成个性化建议
      const sampleSuggestions: Suggestion[] = [
        {
          id: '1',
          type: 'destination',
          title: lang === 'zh' ? '北京故宫博物院' : 'Forbidden City, Beijing',
          description: lang === 'zh' ? '明清两代皇宫，世界文化遗产' : 'Imperial palace, World Heritage site',
          icon: <MapPin className="w-5 h-5 text-[#FF6B35]" />
        },
        {
          id: '2',
          type: 'activity',
          title: lang === 'zh' ? '胡同游' : 'Hutong Tour',
          description: lang === 'zh' ? '体验老北京胡同文化' : 'Experience old Beijing hutong culture',
          icon: <Calendar className="w-5 h-5 text-[#FF6B35]" />
        },
        {
          id: '3',
          type: 'tip',
          title: lang === 'zh' ? '交通建议' : 'Transportation Tips',
          description: lang === 'zh' ? '推荐使用地铁出行' : 'Recommended: Use subway',
          icon: <Clock className="w-5 h-5 text-[#FF6B35]" />
        }
      ];
      setSuggestions(sampleSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('生成建议失败:', error);
    }
  };

  // 获取对话上下文（最近5条消息）
  const getConversationContext = () => {
    return messages.slice(-5).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  };

  const processNewMessage = async (content: string) => {
    if (!content.trim() || isLoading || isThinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    if (onNewNeed) onNewNeed(content);

    try {
      // 传递对话上下文给AI
      const responseText = await aiService.generateTravelAdvice(content, lang);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      }]);

      // 生成AI建议
      await generateSuggestions(content);

    } catch (error) {
      console.error('AI 响应失败:', error);
      const errorMessage = lang === 'zh' ? '抱歉，AI 暂时无法回复，请稍后再试。' : 'Sorry, AI cannot respond right now. Please try later.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading || isThinking) return;
    const content = input;
    processNewMessage(content);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 处理快捷回复
  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setShowSuggestions(false);
    // 自动发送
    setTimeout(() => {
      processNewMessage(reply);
    }, 100);
  };

  // 复制消息
  const handleCopyMessage = async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedMsgId(msg.id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 重新生成AI响应
  const handleRegenerate = async (userMsgId: string) => {
    const userMsgIndex = messages.findIndex(m => m.id === userMsgId);
    if (userMsgIndex === -1) return;

    const userMsg = messages[userMsgIndex];
    const userMsgIdStr = userMsg.id;

    // 删除之前的AI响应
    setMessages(prev => prev.filter(m => m.id !== userMsgIdStr));

    // 重新发送请求
    const userMsgNew: Message = { id: Date.now().toString(), role: 'user', content: userMsg.content, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsgNew]);
    setIsThinking(true);

    try {
      const responseText = await aiService.generateTravelAdvice(userMsg.content, lang);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('AI 响应失败:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const hasMessages = messages.length > 0 || isLoading || isThinking;
  const showHistory = isVisible && !isWelcomeMode && hasMessages;
  const showQuickReplies = isWelcomeMode && quickReplies.length > 0;

  // AI 思考动画组件
  const ThinkingAnimation = () => (
    <div className="flex justify-start">
      <div className="bg-white/95 backdrop-blur-3xl px-5 py-4 rounded-[20px] rounded-bl-none border border-white shadow-xl flex gap-1.5 items-center">
        <div className="flex gap-1.5">
          {[0, 150, 300].map(delay => (
            <div
              key={delay}
              className="w-2 h-2 bg-[#FF6B35]/40 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <span className="text-[11px] text-gray-600 font-medium">
          {lang === 'zh' ? 'AI 思考中...' : 'AI thinking...'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 z-[600] pointer-events-none flex flex-col items-center">
      {/* AI 建议面板 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute inset-0 z-[700] flex items-center justify-end pt-[calc(env(safe-area-inset-top, 20px) + 60px)] pr-6 animate-bubble-in">
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#FF6B35]" />
                {lang === 'zh' ? 'AI 建议' : 'AI Suggestions'}
              </h3>
              <button onClick={() => setShowSuggestions(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    handleQuickReply(suggestion.title);
                    setShowSuggestions(false);
                  }}
                  className="w-full p-4 flex items-start gap-3 hover:bg-orange-50 transition-all active:scale-[0.98] border-b border-gray-50 last:border-0 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-10 h-10 shrink-0 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF6B35]">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-[14px] font-bold text-gray-900 mb-1">{suggestion.title}</h4>
                    {suggestion.description && (
                      <p className="text-[12px] text-gray-500 line-clamp-1">{suggestion.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FF6B35] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`w-full max-w-2xl px-6 transition-all duration-700 cubic-bezier flex flex-col justify-end items-start ${
          showHistory ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
        style={{
          bottom: 'calc(90px + env(safe-area-inset-bottom, 10px))',
          maxHeight: '50%',
          position: 'absolute'
        }}
      >
        {/* 快捷回复 */}
        {showQuickReplies && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quickReplies.slice(0, 4).map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full text-[12px] font-medium text-gray-700 hover:bg-[#FF6B35] hover:text-white hover:border-[#FF6B35] transition-all active:scale-95"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        <div
          ref={scrollRef}
          className={`overflow-y-auto pr-2 space-y-4 smooth-scroll flex flex-col items-start w-full no-scrollbar transition-all`}
          style={{
            maskImage: 'linear-gradient(to top, black 90%, transparent 100%)',
            height: 'fit-content',
            maxHeight: '100%'
          }}
        >
          {messages.map((msg, index) => (
            <div key={msg.id} className="flex w-full justify-start group animate-bubble-in">
              <div className={`max-w-[70%] lg:max-w-[80%] px-5 py-3 rounded-[24px] text-[14px] font-bold border relative ${
                msg.role === 'user'
                  ? 'bg-[#FF6B35] text-white border-[#FF6B35] rounded-br-none shadow-xl'
                  : 'bg-white/95 backdrop-blur-3xl text-gray-800 border-white rounded-br-none shadow-xl'
              }`}>
                {/* 消息内容 */}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* AI 消息操作按钮 */}
                {msg.role === 'assistant' && (
                  <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyMessage(msg)}
                      className="w-6 h-6 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-all"
                      title={lang === 'zh' ? '复制' : 'Copy'}
                    >
                      {copiedMsgId === msg.id ? (
                        <ThumbsUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRegenerate(msg.id)}
                      className="w-6 h-6 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-all"
                      title={lang === 'zh' ? '重新生成' : 'Regenerate'}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && <ThinkingAnimation />}

          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-white/95 backdrop-blur-3xl px-5 py-4 rounded-[20px] rounded-bl-none border border-white shadow-xl flex gap-1.5 items-center">
                  <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin" />
                  <span className="text-[11px] text-gray-600 font-medium">
                    {lang === 'zh' ? '正在回复...' : 'Replying...'}
                  </span>
               </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="absolute w-full max-w-2xl px-6 z-[1000] pointer-events-auto"
        style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 5px))' }}
      >
        <div className="bg-white/95 backdrop-blur-3xl h-[64px] px-6 rounded-[32px] border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-3 group focus-within:shadow-[0_20px_50px_rgba(255,107,53,0.15)] transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (onKeywordSelect) onKeywordSelect(e.target.value);
            }}
            onKeyDown={handleKeyPress}
            onFocus={() => !isVisible && onOpen?.()}
            placeholder={t.searchPlaceholder}
            className="flex-1 bg-transparent border-none focus:outline-none text-[15px] font-normal text-gray-900 placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isThinking}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shrink-0 ${
              input.trim() ? 'bg-[#FF6B35] text-white shadow-lg shadow-orange-100' : 'bg-transparent text-gray-200'
            }`}
          >
            {isLoading || isThinking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* AI 品牌指示器 */}
        <div className="flex items-center justify-center mt-3">
          <div className="flex items-center gap-2 bg-[#FF6B35]/5 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3 text-[#FF6B35]" />
            <span className="text-[10px] text-gray-600 font-medium">
              {lang === 'zh' ? '豆包 AI 助理' : 'Doubao AI Assistant'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatView.displayName = 'ChatView';
export default ChatView;