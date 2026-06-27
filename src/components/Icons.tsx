interface P extends React.SVGProps<SVGSVGElement> {
  size?: number;
}
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const Grid = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.6" />
    <rect x="14" y="3" width="7" height="7" rx="1.6" />
    <rect x="3" y="14" width="7" height="7" rx="1.6" />
    <rect x="14" y="14" width="7" height="7" rx="1.6" />
  </svg>
);

export const Calendar = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
  </svg>
);

export const Chart = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 19V5M4 19h16" />
    <path d="M8 16l3.5-4 3 2.5L20 8" />
  </svg>
);

export const Chat = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 9.5 9.5 0 0 1-4-.9L3 21l1.9-4a8.5 8.5 0 0 1-.9-4 8.38 8.38 0 0 1 8.5-8.4A8.38 8.38 0 0 1 21 11.5z" />
  </svg>
);

export const Sliders = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
    <path d="M1 14h6M9 8h6M17 16h6" />
  </svg>
);

export const Plus = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const PlusSquare = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
);

export const ArrowUp = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const Flame = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 2.5c1.5 3 5 4.5 5 8.5a5 5 0 0 1-10 0c0-1.3.5-2.3 1-3 .4 1 1 1.5 1.8 1.7C9 7 11 5 12 2.5z" />
  </svg>
);

export const Clock = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const Lock = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </svg>
);

export const Check = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);

export const Droplet = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 2.7s6.5 6.4 6.5 11A6.5 6.5 0 0 1 12 20.2a6.5 6.5 0 0 1-6.5-6.5C5.5 9.1 12 2.7 12 2.7z" />
  </svg>
);

export const Dumbbell = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6.5 6.5l11 11M3 9l3-3 2 2-3 3zM16 19l3-3 2 2-3 3zM4 14l-1.5 1.5M20 10l1.5-1.5" />
  </svg>
);

export const Settings = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const Trophy = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M9 18h6M12 13v5M8.5 21h7" />
  </svg>
);

export const Heart = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 20s-7-4.3-9.3-8.5C1.2 8.6 2.6 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.4 0 4.8 3.6 3.3 6.5C19 15.7 12 20 12 20z" />
  </svg>
);

export const Moon = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const TrendUp = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 17l6-6 4 4 8-8M21 7h-5M21 7v5" />
  </svg>
);

export const Apple = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 7c-1.5-2-4-2.5-5.5-1C5 7 4.5 9.5 5.5 13c.8 2.8 2.5 5 4 5 .8 0 1.3-.4 2-.4s1.2.4 2 .4c1.5 0 3.2-2.2 4-5 1-3.5.5-6-1-7-1.5-1.5-4-1-5.5 1z" />
    <path d="M12 7c0-1.5.5-3 2-4" />
  </svg>
);

export const X = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ChevronRight = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const Minus = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14" />
  </svg>
);

export const Bolt = ({ size = 22, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);
