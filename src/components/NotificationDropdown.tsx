"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Info, Warning, X } from '@phosphor-icons/react/dist/ssr';
import { useNotifications, Notification } from './NotificationsProvider';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#22C55E]" weight="fill" />;
      case 'warning':
        return <Warning className="w-5 h-5 text-[#Eab308]" weight="fill" />;
      case 'error':
        return <Warning className="w-5 h-5 text-red-500" weight="fill" />;
      default:
        return <Info className="w-5 h-5 text-[#3b82f6]" weight="fill" />;
    }
  };

  const getBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-transparent';
    switch (type) {
      case 'success': return 'bg-[#22C55E]/5';
      case 'warning': return 'bg-[#Eab308]/5';
      case 'error': return 'bg-red-500/5';
      default: return 'bg-[#3b82f6]/5';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all flex items-center justify-center ${
          isOpen ? 'bg-[#161B22] text-white' : 'text-[#8B949E] hover:bg-[#161B22] hover:text-white'
        }`}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-[#D4AF37]' : ''}`} weight={isOpen ? "fill" : "regular"} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-[#0D1117]"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] right-0 w-[320px] sm:w-[380px] bg-[#0D1117] border border-[#1C2128] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="p-4 border-b border-[#1C2128] flex items-center justify-between bg-[#070A0D]/50 backdrop-blur-md">
            <h3 className="font-extrabold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-[#D4AF37] hover:text-[#Eab308] transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar flex flex-col">
            {notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <Bell className="w-8 h-8 text-[#8B949E] mb-3 opacity-50" weight="light" />
                <p className="text-sm font-bold text-white mb-1">No notifications</p>
                <p className="text-xs text-[#8B949E]">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`p-4 border-b border-[#1C2128]/50 flex gap-3 transition-colors cursor-pointer hover:bg-[#161B22] ${getBgColor(notif.type, notif.is_read)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className={`text-sm font-bold ${notif.is_read ? 'text-[#8B949E]' : 'text-white'}`}>
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${notif.is_read ? 'text-[#8B949E]/70' : 'text-[#8B949E]'}`}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] font-semibold text-[#8B949E]/50 mt-2">
                      {new Date(notif.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
