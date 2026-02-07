import React, { useState } from 'react';

const POSITIONS = {
  top: {
    tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent border-4',
  },
  bottom: {
    tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent border-4',
  },
  left: {
    tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent border-4',
  },
  right: {
    tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent border-4',
  },
};

export default function Tooltip({
  children,
  content,
  position = 'top',
}) {
  const [visible, setVisible] = useState(false);
  const pos = POSITIONS[position] || POSITIONS.top;

  if (!content) return children;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <div
        className={[
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 shadow-lg transition-all duration-150',
          pos.tooltip,
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        ].join(' ')}
      >
        {content}
        <span className={['absolute', pos.arrow].join(' ')} />
      </div>
    </div>
  );
}
