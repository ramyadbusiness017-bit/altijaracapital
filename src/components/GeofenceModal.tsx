"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function GeofenceModal() {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-lg p-8 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200"
          >
            <div className="flex items-center justify-center w-14 h-14 mb-6 rounded-full bg-amber-50 border border-amber-100">
              <ShieldAlert className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-slate-900">
              Regulatory Compliance Notice
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-500">
              Al-Tijara Capital operates strictly within the financial jurisdictions of the Dubai International Financial Centre (DIFC). By proceeding, you confirm that you are a resident of the UAE or an accredited international partner.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setIsOpen(false)} className="flex-1 px-5 py-3 font-semibold text-white transition-colors rounded-xl bg-amber-600 hover:bg-amber-700 shadow-sm">
                Confirm & Enter
              </button>
              <button className="flex-1 px-5 py-3 font-semibold transition-colors border rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                Exit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}