"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { submitSupportTicket } from '@/app/actions/support';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  PaperPlaneRight, 
  Question, 
  Headset, 
  ChatCircleText,
  Clock,
  CheckCircle,
  CaretDown,
  EnvelopeSimple
} from '@phosphor-icons/react/dist/ssr';

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function SupportCenter({ initialTickets }: { initialTickets: Ticket[] }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('realtime_support_tickets')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_tickets' },
        (payload) => {
          const updatedTicket = payload.new as Ticket;
          setTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...t, status: updatedTicket.status } : t));
          // Refresh Next.js cache gracefully in the background
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);
  
  const faqs = [
    {
      q: "How long does withdrawals take?",
      a: "Capital withdrawals take 48-72 hours to process after approval. Earnings withdrawals are typically processed within 24 hours."
    },
    {
      q: "How do I upgrade my portfolio tier?",
      a: "Your tier automatically upgrades when your capital balance meets the next threshold. Please refer to our tier guide in the Investments tab."
    },
    {
      q: "Can I use multiple wallets?",
      a: "Currently, you can link one verified UIA wallet address per account for security and anti-money laundering compliance."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return toast.error('Please fill in all fields');
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting your query...');
    
    const res = await submitSupportTicket(subject, message);
    
    if (res.success) {
      toast.success('Ticket submitted successfully! We will get back to you soon.', { id: loadingToast });
      // Optimistic addition
      const newTicket: Ticket = {
        id: Math.random().toString(),
        subject,
        message,
        status: 'Open',
        created_at: new Date().toISOString()
      };
      setTickets([newTicket, ...tickets]);
      setSubject('');
      setMessage('');
    } else {
      toast.error(res.error || 'Failed to submit ticket', { id: loadingToast });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col pt-8 pb-32 px-4 sm:px-8 lg:px-10 gap-10 min-h-screen">
      


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Main Content Area - Form & History */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Contact Form Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0D1117]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
              <EnvelopeSimple weight="fill" className="text-[#D4AF37] w-5 h-5" />
              Send a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
              <div>
                <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What is this regarding?"
                  className="w-full bg-[#161B22] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-[#8B949E]/50 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8B949E] uppercase tracking-wider mb-2">Message</label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  className="w-full bg-[#161B22] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-[#8B949E]/50 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto self-end flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B89600] text-black font-extrabold rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Submit Ticket'}
                <PaperPlaneRight weight="fill" className="w-5 h-5" />
              </button>
            </form>
          </motion.div>

          {/* Ticket History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2 px-2">
              <Clock weight="fill" className="text-[#8B949E] w-5 h-5" />
              Recent Queries
            </h2>
            
            {tickets.length === 0 ? (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center">
                <ChatCircleText weight="light" className="w-12 h-12 text-[#8B949E]/50 mx-auto mb-3" />
                <p className="text-[#8B949E] font-medium">You have no previous support tickets.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {tickets.map((ticket, i) => (
                    <motion.div 
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#0D1117] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-white">{ticket.subject}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                          ticket.status.toLowerCase() === 'open' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 
                          ticket.status.toLowerCase() === 'resolved' ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20' : 
                          'bg-white/10 text-[#8B949E]'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#8B949E] mb-4 line-clamp-2">{ticket.message}</p>
                      <div className="flex justify-between items-center text-xs text-[#8B949E]/70 font-medium">
                        <span>Ticket ID: #{ticket.id.slice(0, 8)}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar - FAQs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-b from-[#161B22] to-[#0D1117] border border-white/5 rounded-[2rem] p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl">
                <Question weight="fill" className="text-[#D4AF37] w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-white">Quick Answers</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-white/5 rounded-xl overflow-hidden bg-white/5 transition-colors hover:bg-white/10">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-bold text-sm text-white">{faq.q}</span>
                    <CaretDown weight="bold" className={`w-4 h-4 text-[#8B949E] transition-transform ${activeFaq === i ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm text-[#8B949E] leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Live Chat placeholder integration block */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-[2rem] p-6 shadow-xl text-center flex flex-col items-center justify-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(212,175,55,0.4)] relative z-10">
              <ChatCircleText weight="fill" className="text-black w-6 h-6" />
            </div>
            <h3 className="text-white font-extrabold mb-2 relative z-10">Need instant help?</h3>
            <p className="text-[#8B949E] text-sm font-medium mb-4 relative z-10">
              Our Smartsupp live chat widget is available in the bottom right corner of your screen.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
