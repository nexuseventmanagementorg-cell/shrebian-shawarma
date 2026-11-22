'use client';

import { useId, useState } from 'react';
import { MessageCircle, Printer } from 'lucide-react';

interface ReceiptActionsProps {
  onPrint: () => void;
  whatsappUrl: string;
  onDone: () => void;
  printLabel: string;
  doneLabel: string;
}

export function ReceiptActions({
  onPrint,
  whatsappUrl,
  onDone,
  printLabel,
  doneLabel
}: ReceiptActionsProps) {
  const id = useId();
  const [confirmed, setConfirmed] = useState({
    print: false,
    whatsapp: false,
    done: false
  });
  const allConfirmed = confirmed.print && confirmed.whatsapp && confirmed.done;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <input
          id={`${id}-print`}
          type="checkbox"
          checked={confirmed.print}
          onChange={event => setConfirmed(current => ({ ...current, print: event.target.checked }))}
          className="h-4 w-4 shrink-0 accent-amber-500"
        />
        <div className="flex-1 min-w-0">
          <label htmlFor={`${id}-print`} className="mb-1 block cursor-pointer text-[10px] text-gray-300">
            Confirm print
          </label>
          <button
            type="button"
            onClick={onPrint}
            disabled={!confirmed.print}
            className="w-full py-3 rounded-xl bg-shrebian-card hover:bg-shrebian-elevated border border-shrebian-border text-xs font-bold text-white flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer className="w-4 h-4 text-shrebian-gold" />
            <span>{printLabel}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <input
          id={`${id}-whatsapp`}
          type="checkbox"
          checked={confirmed.whatsapp}
          onChange={event => setConfirmed(current => ({ ...current, whatsapp: event.target.checked }))}
          className="h-4 w-4 shrink-0 accent-emerald-500"
        />
        <div className="flex-1 min-w-0">
          <label htmlFor={`${id}-whatsapp`} className="mb-1 block cursor-pointer text-[10px] text-gray-300">
            Confirm WhatsApp
          </label>
          <a
            href={confirmed.whatsapp ? whatsappUrl : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!confirmed.whatsapp}
            className={`w-full py-3 rounded-xl bg-emerald-600 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all ${
              confirmed.whatsapp ? 'hover:bg-emerald-500' : 'cursor-not-allowed opacity-40'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WHATSAPP RECEIPT</span>
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <input
          id={`${id}-done`}
          type="checkbox"
          checked={confirmed.done}
          onChange={event => setConfirmed(current => ({ ...current, done: event.target.checked }))}
          className="h-4 w-4 shrink-0 accent-red-500"
        />
        <div className="flex-1 min-w-0">
          <label htmlFor={`${id}-done`} className="mb-1 block cursor-pointer text-[10px] text-gray-300">
            Confirm done
          </label>
          <button
            type="button"
            onClick={onDone}
            disabled={!allConfirmed}
            className="w-full py-3 rounded-xl bg-shrebian-red hover:bg-shrebian-red-hover text-xs font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
          >
            {doneLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
