import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, AlertCircle, RefreshCw } from 'lucide-react';
import { FAQ_DATA } from '../../data/faqData';
import { STAGES_DATA } from '../../data/stagesData';
import { DOCUMENTS_DATA } from '../../data/documentsData';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, lang }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-welcome',
      sender: 'bot',
      text: lang === 'vi'
        ? 'Xin chào bạn! Tôi là Trợ lý AI Cố vấn Học phần Thực tập (TSNN & KTCN) của Khoa CNTT - TDTU. Bạn có thắc mắc gì về quy trình 120H, con dấu mộc tròn, biểu mẫu BM01-BM06 hay cách nộp HSMH không?'
        : 'Hello! I am your TDTU IT Faculty Internship Advisor AI. Do you have any questions regarding the 120H regulations, company seals, forms BM01-BM06, or dossier submission?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Trả lời thông minh dựa trên tri thức quy chế TDTU
  const generateResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Vấn đề Mộc tròn / Mộc đỏ / Con dấu
    if (q.includes('mộc') || q.includes('dấu') || q.includes('seal') || q.includes('stamp')) {
      return `📌 **Quy chế về Con dấu Doanh nghiệp tại Khoa CNTT TDTU:**
1. **Các biểu mẫu bắt buộc có mộc:** BM01 (Tiếp nhận), BM03 (Trang kết thúc nhật ký), BM04 (Phiếu đánh giá điểm).
2. **Loại mộc được chấp nhận:** Bắt buộc là **mộc tròn đỏ pháp nhân** của Doanh nghiệp hoặc Chi nhánh/Văn phòng đại diện có thẩm quyền.
3. **Trường hợp Start-up / Mộc vuông:** Nếu công ty chỉ có mộc vuông hoặc không dùng con dấu, bạn bắt buộc phải nộp kèm bản sao **Giấy phép Đăng ký kinh doanh (ĐKKD)** có Mã số thuế còn hoạt động để Khoa xác minh tính pháp lý.`;
    }

    // 2. Vấn đề Song hành cả 2 môn TSNN và KTCN
    if (q.includes('song hành') || q.includes('cả 2 môn') || q.includes('hai môn') || q.includes('dual')) {
      return `📌 **Quy định khi Học Song Hành cả TSNN và KTCN:**
1. **Tổng số giờ tích lũy:** Bắt buộc đạt **≥ 240 giờ** (120 giờ cho TSNN + 120 giờ cho KTCN).
2. **Hồ sơ:** Phải lập thành **2 bộ hồ sơ riêng biệt** hoàn chỉnh.
3. **Nhật ký BM03:** Nhiệm vụ và công việc phân công giữa 2 môn trong nhật ký phải rõ ràng, tránh sao chép y hệt nội dung của nhau.`;
    }

    // 3. Vấn đề Giờ thực tập / 120 giờ
    if (q.includes('120') || q.includes('giờ') || q.includes('thời lượng') || q.includes('hour')) {
      return `📌 **Quy định về Thời lượng Thực tập:**
- Mỗi học phần yêu cầu tối thiểu **≥ 120 giờ làm việc thực tế** tại doanh nghiệp.
- Sinh viên có thể làm Part-time (khoảng 20h/tuần trong 6-8 tuần) hoặc Full-time (khoảng 40h/tuần trong 3-4 tuần).
- Mọi giờ làm việc phải được ghi chép trong Nhật ký BM03 và có chữ ký xác nhận của Cán bộ hướng dẫn hàng tuần.`;
    }

    // 4. Vấn đề Đổi công ty thực tập
    if (q.includes('đổi') || q.includes('chuyển') || q.includes('nghỉ') || q.includes('change')) {
      return `📌 **Quy trình Thay đổi Doanh nghiệp thực tập:**
- Chỉ được giải quyết trong vòng **2 - 3 tuần đầu tiên** của học kỳ.
- Thủ tục: Làm đơn xin thay đổi đơn vị thực tập nêu rõ lý do, nộp giấy xác nhận ngừng thực tập từ công ty cũ và nộp lại BM01 mới từ công ty tiếp nhận mới về cho Giảng viên phụ trách/Khoa.`;
    }

    // 5. Vấn đề Tên file / Nộp bài / HSMH
    if (q.includes('tên file') || q.includes('nộp') || q.includes('file name') || q.includes('hsmh') || q.includes('pdf')) {
      return `📌 **Quy chuẩn Đặt tên file nộp bài:**
- Cú pháp chuẩn: \`[MSSV]_[Hovaten]_[TenBM].pdf\`
- Ví dụ: \`521H0123_NguyenVanA_BM01.pdf\` hoặc \`521H0123_NguyenVanA_HSMH.pdf\`.
- **Lưu ý cốt tử:** Tuyệt đối KHÔNG chứa dấu cách, họ tên viết không dấu, chỉ nộp file scan màu định dạng \`.pdf\`. Hãy dùng công cụ **Filename Validator** của Cổng để kiểm tra trước khi nộp!`;
    }

    // 6. Câu hỏi về Biểu mẫu BM01 đến BM06
    if (q.includes('bm01') || q.includes('bm02') || q.includes('bm03') || q.includes('bm04') || q.includes('bm05') || q.includes('bm06')) {
      return `📌 **Tổng quan Hệ thống Biểu mẫu TDTU:**
- **BM01:** Phiếu tiếp nhận SV (Có mộc đỏ) - Nộp GĐ1.
- **BM02:** Bản cam kết sinh viên - Nộp GĐ1.
- **BM03:** Nhật ký thực tập hàng tuần (≥120H, có chữ ký mentor và mộc đỏ trang cuối) - Nộp GĐ2 & GĐ3.
- **BM04:** Phiếu đánh giá điểm số của Doanh nghiệp (Có mộc đỏ, không tẩy xóa) - Nộp GĐ3.
- **BM05:** Báo cáo chuyên môn kỹ thuật (25-45 trang) - Nộp GĐ3.
- **BM06:** Phiếu khảo sát ý kiến sinh viên - Nộp GĐ3.`;
    }

    // 7. Câu hỏi mặc định
    return `Cảm ơn bạn đã hỏi. Về nội dung này:
Theo Cẩm nang thực tập Khoa CNTT - Trường Đại học Tôn Đức Thắng:
- Mọi hoạt động thực tập phải đảm bảo đúng tiến độ học kỳ (15 tuần) và đủ minh chứng tại doanh nghiệp.
- Nếu bạn gặp sự cố đặc biệt về đề tài, hợp đồng hay mentor, vui lòng liên hệ trực tiếp với Giảng viên hướng dẫn phụ trách nhóm lớp của bạn qua email chính thức @tdtu.edu.vn hoặc văn phòng Khoa CNTT.
Bạn có thể tham khảo thêm tại mục **5. Xử lý sự cố** hoặc sử dụng **Bộ công cụ Sinh viên** ở menu trên nhé!`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateResponse(userText);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sampleQuestions = [
    'Công ty chỉ có mộc vuông thì xử lý sao?',
    'Học song hành cả TSNN và KTCN tính bao nhiêu giờ?',
    'Quy định đặt tên file nộp bài thế nào?',
    'Có được đổi công ty thực tập giữa chừng không?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant/40 flex flex-col h-[600px] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-primary font-display">
                  Trợ Lý AI Quy Chế TSNN & KTCN
                </h3>
                <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Dữ liệu chuẩn hóa theo Cẩm nang thực tập Khoa CNTT TDTU
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-secondary/15 text-secondary'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-primary text-on-primary rounded-tr-none'
                    : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-tl-none'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-on-primary/70' : 'text-on-surface-variant/60'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce delay-200" />
              <span>Trợ lý AI đang tra cứu quy chế...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 bg-surface-container-low/50 border-t border-outline-variant/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-on-surface-variant shrink-0">Hỏi nhanh:</span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(q);
              }}
              className="px-2.5 py-1 rounded-full text-[11px] bg-surface-container-lowest border border-outline-variant/30 hover:border-secondary hover:text-secondary whitespace-nowrap text-on-surface-variant transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi quy chế (vd: mộc tròn, 120H, BM04, song hành...)..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-surface-container-low/40 border border-outline-variant text-xs sm:text-sm focus:border-secondary focus:outline-none text-on-surface placeholder:text-on-surface-variant/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
