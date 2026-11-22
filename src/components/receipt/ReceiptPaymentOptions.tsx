'use client';

import { useState } from 'react';

const paymentOptions = ['Cash / Takeaway', 'JazzCash', 'Easypaisa'];

export function ReceiptPaymentOptions() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    setSelectedOptions(current =>
      current.includes(option)
        ? current.filter(selected => selected !== option)
        : [...current, option]
    );
  };

  return (
    <div className="receipt-payment-options border-t border-dashed border-gray-400 pt-2">
      <div className="mb-1 text-center font-bold">PAYMENT METHOD</div>
      <div className="grid grid-cols-3 gap-1">
        {paymentOptions.map(option => (
          <label
            key={option}
            className="receipt-payment-option flex min-h-8 cursor-pointer items-center justify-center gap-1 text-center text-[9px] leading-tight"
          >
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => toggleOption(option)}
              aria-label={option}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
