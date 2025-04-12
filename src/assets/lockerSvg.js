export const LockerSvgs = {
    available: `<svg viewBox="0 0 512 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="availableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#E8EDF2"/>
        <stop offset="100%" style="stop-color:#CED4DA"/>
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
    </defs>
    <rect x="10" y="20" width="492" height="216" rx="8" fill="url(#availableGrad)" filter="url(#shadow)"/>
    <rect x="25" y="35" width="462" height="186" rx="4" fill="#FFFFFF" stroke="#8898AA" stroke-width="2"/>
    <!-- Hinges -->
    <g transform="translate(35, 65)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <g transform="translate(35, 128)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <g transform="translate(35, 191)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <!-- Door Nob -->
    <g transform="translate(420, 128)">
      <circle r="35.31" style="fill:#5B5D6E;"/>
      <path style="fill:#959CB3;" transform="scale(0.4) translate(-256, -304)" d="M324.979,259.699c-2.84-3.982-8.358-4.897-12.314-2.051L256,298.121l-56.664-40.474 c-3.966-2.845-9.487-1.931-12.314,2.051c-2.831,3.966-1.913,9.483,2.056,12.31l58.095,41.497v66.081 c0,4.879,3.953,8.828,8.828,8.828s8.828-3.948,8.828-8.828v-66.081l58.094-41.496C326.892,269.181,327.81,263.663,324.979,259.699z"/>
      <circle r="17.655" style="fill:#AFB9D2;"/>
      <path d="M-8 0h16M0 -8v16" stroke="#2C3E50" stroke-width="3" stroke-linecap="round"/>
    </g>
  </svg>`,

    occupied: `<svg viewBox="0 0 512 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="occupiedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#4A5568"/>
        <stop offset="100%" style="stop-color:#2D3748"/>
      </linearGradient>
    </defs>
    <rect x="10" y="20" width="492" height="216" rx="8" fill="url(#occupiedGrad)" filter="url(#shadow)"/>
    <rect x="25" y="35" width="462" height="186" rx="4" fill="#959CB3" stroke="#2D3748" stroke-width="2"/>
    <!-- Hinges -->
    <g transform="translate(35, 65)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <g transform="translate(35, 128)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <g transform="translate(35, 191)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <!-- Door Nob -->
    <g transform="translate(420, 128)">
      <circle r="35.31" style="fill:#5B5D6E;"/>
      <path style="fill:#2D3748;" transform="scale(0.4) translate(-256, -304)" d="M324.979,259.699c-2.84-3.982-8.358-4.897-12.314-2.051L256,298.121l-56.664-40.474 c-3.966-2.845-9.487-1.931-12.314,2.051c-2.831,3.966-1.913,9.483,2.056,12.31l58.095,41.497v66.081 c0,4.879,3.953,8.828,8.828,8.828s8.828-3.948,8.828-8.828v-66.081l58.094-41.496C326.892,269.181,327.81,263.663,324.979,259.699z"/>
      <circle r="17.655" style="fill:#A0A4AC;"/>
      <path d="M-8 0h16" stroke="#2D3748" stroke-width="3" stroke-linecap="round"/>
    </g>
  </svg>`,

    selected: `<svg viewBox="0 0 512 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="selectedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#4299E1"/>
        <stop offset="100%" style="stop-color:#2B6CB0"/>
      </linearGradient>
    </defs>
    <rect x="10" y="20" width="492" height="216" rx="8" fill="url(#selectedGrad)" filter="url(#shadow)"/>
    <rect x="25" y="35" width="462" height="186" rx="4" fill="#EBF8FF" stroke="#2B6CB0" stroke-width="2"/>
    <!-- Hinges -->
    <g transform="translate(35, 65)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <g transform="translate(35, 128)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <g transform="translate(35, 191)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <!-- Door Nob -->
    <g transform="translate(420, 128)">
      <circle r="35.31" style="fill:#5B5D6E;"/>
      <path style="fill:#2B6CB0;" transform="scale(0.4) translate(-256, -304)" d="M324.979,259.699c-2.84-3.982-8.358-4.897-12.314-2.051L256,298.121l-56.664-40.474 c-3.966-2.845-9.487-1.931-12.314,2.051c-2.831,3.966-1.913,9.483,2.056,12.31l58.095,41.497v66.081 c0,4.879,3.953,8.828,8.828,8.828s8.828-3.948,8.828-8.828v-66.081l58.094-41.496C326.892,269.181,327.81,263.663,324.979,259.699z"/>
      <circle r="17.655" style="fill:#4299E1;"/>
      <path d="M-12 0l8 8l16 -16" stroke="#EBF8FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`,

    maintenance: `<svg viewBox="0 0 512 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="maintenanceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#F6AD55"/>
        <stop offset="100%" style="stop-color:#DD6B20"/>
      </linearGradient>
    </defs>
    <rect x="10" y="20" width="492" height="216" rx="8" fill="url(#maintenanceGrad)" filter="url(#shadow)"/>
    <rect x="25" y="35" width="462" height="186" rx="4" fill="#FFFAF0" stroke="#DD6B20" stroke-width="2"/>
    <!-- Hinges -->
    <g transform="translate(35, 65)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <g transform="translate(35, 128)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <g transform="translate(35, 191)">
      <rect width="26" height="8" rx="2" fill="#2C3E50"/>
      <circle cx="13" cy="4" r="3" fill="#BDC3C7"/>
      <rect x="2" y="3" width="22" height="2" fill="#7F8C8D"/>
    </g>
    <!-- Door Nob -->
    <g transform="translate(420, 128)">
      <circle r="35.31" style="fill:#5B5D6E;"/>
      <path style="fill:#DD6B20;" transform="scale(0.4) translate(-256, -304)" d="M324.979,259.699c-2.84-3.982-8.358-4.897-12.314-2.051L256,298.121l-56.664-40.474 c-3.966-2.845-9.487-1.931-12.314,2.051c-2.831,3.966-1.913,9.483,2.056,12.31l58.095,41.497v66.081 c0,4.879,3.953,8.828,8.828,8.828s8.828-3.948,8.828-8.828v-66.081l58.094-41.496C326.892,269.181,327.81,263.663,324.979,259.699z"/>
      <circle r="17.655" style="fill:#F6AD55;"/>
      <path d="M0 -8v16" stroke="#FFFAF0" stroke-width="3" stroke-linecap="round"/>
    </g>
  </svg>`
};
