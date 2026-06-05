import { Module } from './types';

export const MODULE_THUMBS: Record<number, string> = {
  1: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#0D47A1"/>
    <rect x="0" y="0" width="280" height="140" fill="url(#g1)" opacity="0.4"/>
    <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1565C0"/><stop offset="100%" stop-color="#0A3880"/></linearGradient></defs>
    <!-- Grid dots -->
    <g fill="rgba(255,255,255,0.08)">
      <circle cx="20" cy="20" r="2"/><circle cx="50" cy="20" r="2"/><circle cx="80" cy="20" r="2"/><circle cx="110" cy="20" r="2"/><circle cx="140" cy="20" r="2"/><circle cx="170" cy="20" r="2"/><circle cx="200" cy="20" r="2"/><circle cx="230" cy="20" r="2"/><circle cx="260" cy="20" r="2"/>
      <circle cx="20" cy="50" r="2"/><circle cx="50" cy="50" r="2"/><circle cx="80" cy="50" r="2"/><circle cx="110" cy="50" r="2"/><circle cx="140" cy="50" r="2"/><circle cx="170" cy="50" r="2"/><circle cx="200" cy="50" r="2"/><circle cx="230" cy="50" r="2"/><circle cx="260" cy="50" r="2"/>
      <circle cx="20" cy="80" r="2"/><circle cx="50" cy="80" r="2"/><circle cx="80" cy="80" r="2"/><circle cx="110" cy="80" r="2"/><circle cx="140" cy="80" r="2"/><circle cx="170" cy="80" r="2"/><circle cx="200" cy="80" r="2"/><circle cx="230" cy="80" r="2"/><circle cx="260" cy="80" r="2"/>
      <circle cx="20" cy="110" r="2"/><circle cx="50" cy="110" r="2"/><circle cx="80" cy="110" r="2"/><circle cx="110" cy="110" r="2"/><circle cx="140" cy="110" r="2"/><circle cx="170" cy="110" r="2"/><circle cx="200" cy="110" r="2"/><circle cx="230" cy="110" r="2"/><circle cx="260" cy="110" r="2"/>
    </g>
    <!-- Binary blocks -->
    <rect x="30" y="35" width="32" height="32" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="46" y="57" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="white">01</text>
    <rect x="76" y="35" width="32" height="32" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="92" y="57" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="white">10</text>
    <rect x="122" y="35" width="32" height="32" rx="6" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
    <text x="138" y="57" text-anchor="middle" font-family="monospace" font-size="14" font-weight="bold" fill="white">11</text>
    <!-- Arrow -->
    <text x="168" y="57" text-anchor="middle" font-size="18" fill="rgba(255,255,255,0.5)">→</text>
    <!-- Decimal -->
    <rect x="184" y="35" width="60" height="32" rx="6" fill="#FFF176" stroke="#F9A825" stroke-width="1.5"/>
    <text x="214" y="57" text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="#0D47A1">13</text>
    <!-- Bottom label row -->
    <rect x="30" y="90" width="44" height="16" rx="4" fill="rgba(255,255,255,0.1)"/>
    <text x="52" y="102" text-anchor="middle" font-family="monospace" font-size="9" fill="rgba(255,255,255,0.6)">BINARY</text>
    <rect x="84" y="90" width="44" height="16" rx="4" fill="rgba(255,255,255,0.1)"/>
    <text x="106" y="102" text-anchor="middle" font-family="monospace" font-size="9" fill="rgba(255,255,255,0.6)">OCTAL</text>
    <rect x="138" y="90" width="44" height="16" rx="4" fill="rgba(255,255,255,0.1)"/>
    <text x="160" y="102" text-anchor="middle" font-family="monospace" font-size="9" fill="rgba(255,255,255,0.6)">HEX</text>
  </svg>`,
  2: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#1A237E"/>
    <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#283593"/><stop offset="100%" stop-color="#0D1B6E"/></linearGradient></defs>
    <rect width="280" height="140" fill="url(#g2)"/>
    <!-- Wire horizontal -->
    <line x1="20" y1="70" x2="80" y2="70" stroke="#64B5F6" stroke-width="2.5"/>
    <!-- Resistor 1 -->
    <rect x="80" y="62" width="36" height="16" rx="3" fill="#FFA726" stroke="#FF6F00" stroke-width="1.5"/>
    <line x1="116" y1="70" x2="140" y2="70" stroke="#64B5F6" stroke-width="2.5"/>
    <!-- Resistor 2 -->
    <rect x="140" y="62" width="36" height="16" rx="3" fill="#FFA726" stroke="#FF6F00" stroke-width="1.5"/>
    <line x1="176" y1="70" x2="200" y2="70" stroke="#64B5F6" stroke-width="2.5"/>
    <!-- Battery -->
    <rect x="200" y="52" width="44" height="36" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    <line x1="208" y1="62" x2="208" y2="78" stroke="white" stroke-width="3"/>
    <line x1="216" y1="58" x2="216" y2="82" stroke="white" stroke-width="1.5"/>
    <text x="230" y="74" text-anchor="middle" font-size="11" font-weight="bold" fill="#FFF176">9V</text>
    <!-- Close circuit -->
    <line x1="244" y1="70" x2="260" y2="70" stroke="#64B5F6" stroke-width="2.5"/>
    <line x1="260" y1="35" x2="260" y2="70" stroke="#64B5F6" stroke-width="2.5"/>
    <line x1="20" y1="35" x2="260" y2="35" stroke="#64B5F6" stroke-width="2.5"/>
    <line x1="20" y1="35" x2="20" y2="70" stroke="#64B5F6" stroke-width="2.5"/>
    <!-- Current dots -->
    <circle cx="50" cy="70" r="4" fill="#4FC3F7" opacity="0.8"/>
    <circle cx="105" cy="35" r="4" fill="#4FC3F7" opacity="0.6"/>
    <circle cx="200" cy="35" r="4" fill="#4FC3F7" opacity="0.4"/>
    <!-- Labels -->
    <text x="98" y="58" text-anchor="middle" font-family="monospace" font-size="8" fill="rgba(255,255,255,0.5)">R1</text>
    <text x="158" y="58" text-anchor="middle" font-family="monospace" font-size="8" fill="rgba(255,255,255,0.5)">R2</text>
    <!-- Voltage indicator -->
    <rect x="30" y="90" width="80" height="22" rx="5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="70" y="105" text-anchor="middle" font-size="10" fill="#80DEEA">V = I × R</text>
    <rect x="125" y="90" width="80" height="22" rx="5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="165" y="105" text-anchor="middle" font-size="10" fill="#A5D6A7">P = V × I</text>
  </svg>`,
  3: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#1B5E20"/>
    <defs><linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2E7D32"/><stop offset="100%" stop-color="#1B5E20"/></linearGradient></defs>
    <rect width="280" height="140" fill="url(#g3)"/>
    <!-- Sun -->
    <circle cx="240" cy="28" r="18" fill="#FFF176" opacity="0.9"/>
    <line x1="240" y1="4" x2="240" y2="10" stroke="#FFF176" stroke-width="2" opacity="0.6"/>
    <line x1="240" y1="46" x2="240" y2="52" stroke="#FFF176" stroke-width="2" opacity="0.6"/>
    <line x1="216" y1="28" x2="210" y2="28" stroke="#FFF176" stroke-width="2" opacity="0.6"/>
    <line x1="264" y1="28" x2="270" y2="28" stroke="#FFF176" stroke-width="2" opacity="0.6"/>
    <!-- Ground -->
    <rect x="0" y="110" width="280" height="30" fill="#4E342E"/>
    <!-- Tree/Plant (producer) -->
    <rect x="54" y="75" width="6" height="35" fill="#5D4037"/>
    <ellipse cx="57" cy="62" rx="22" ry="20" fill="#43A047"/>
    <ellipse cx="42" cy="72" rx="14" ry="12" fill="#2E7D32"/>
    <ellipse cx="72" cy="72" rx="14" ry="12" fill="#2E7D32"/>
    <!-- Arrow 1 -->
    <path d="M 90 80 L 118 80" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" marker-end="url(#arrow)" stroke-dasharray="4,2"/>
    <defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.5)"/></marker></defs>
    <!-- Rabbit (consumer 1) -->
    <ellipse cx="135" cy="88" rx="12" ry="9" fill="#E0E0E0"/>
    <ellipse cx="130" cy="80" rx="4" ry="8" fill="#E0E0E0"/>
    <ellipse cx="138" cy="79" rx="4" ry="8" fill="#E0E0E0"/>
    <circle cx="135" cy="87" r="3" fill="#BDBDBD"/>
    <!-- Arrow 2 -->
    <path d="M 156 80 L 184 80" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-dasharray="4,2"/>
    <text x="184" y="76" font-size="14" fill="rgba(255,255,255,0.5)">→</text>
    <!-- Fox (consumer 2) -->
    <ellipse cx="205" cy="88" rx="13" ry="9" fill="#FF8F00"/>
    <polygon points="198,82 194,72 204,80" fill="#FF8F00"/>
    <polygon points="212,82 216,72 206,80" fill="#FF8F00"/>
    <circle cx="200" cy="86" r="2" fill="#1A1A2E"/>
    <circle cx="210" cy="86" r="2" fill="#1A1A2E"/>
    <!-- Labels -->
    <text x="57" y="132" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.6)">Produsen</text>
    <text x="135" y="132" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.6)">Konsumen I</text>
    <text x="205" y="132" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.6)">Konsumen II</text>
  </svg>`,
  4: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#212121"/>
    <!-- Grid lines -->
    <line x1="0" y1="105" x2="280" y2="105" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <line x1="30" y1="0" x2="30" y2="140" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="4,4"/>
    <!-- Trajectory arc -->
    <path d="M 30 105 Q 110 20 190 105" stroke="#64B5F6" stroke-width="2.5" fill="none"/>
    <!-- Ball positions -->
    <circle cx="30" cy="105" r="8" fill="#1565C0" stroke="#64B5F6" stroke-width="2"/>
    <circle cx="80" cy="62" r="7" fill="#1565C0" stroke="#64B5F6" stroke-width="2" opacity="0.7"/>
    <circle cx="110" cy="35" r="7" fill="#1565C0" stroke="#64B5F6" stroke-width="2" opacity="0.5"/>
    <circle cx="150" cy="62" r="7" fill="#1565C0" stroke="#64B5F6" stroke-width="2" opacity="0.7"/>
    <circle cx="190" cy="105" r="8" fill="#64B5F6" stroke="white" stroke-width="2"/>
    <!-- Velocity arrows -->
    <line x1="30" y1="105" x2="55" y2="78" stroke="#FFA726" stroke-width="2" marker-end="url(#arrO)"/>
    <line x1="110" y1="35" x2="136" y2="35" stroke="#FFA726" stroke-width="2" marker-end="url(#arrO)"/>
    <defs><marker id="arrO" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#FFA726"/></marker></defs>
    <!-- Gravity arrow -->
    <line x1="110" y1="35" x2="110" y2="62" stroke="#EF5350" stroke-width="2" marker-end="url(#arrR)"/>
    <defs><marker id="arrR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#EF5350"/></marker></defs>
    <text x="116" y="54" font-size="9" fill="#EF5350">g</text>
    <!-- Formula -->
    <rect x="200" y="25" width="68" height="42" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="234" y="42" text-anchor="middle" font-size="9" fill="#FFF176">F = m·a</text>
    <line x1="206" y1="48" x2="262" y2="48" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
    <text x="234" y="60" text-anchor="middle" font-size="9" fill="#80DEEA">v = v₀+at</text>
    <!-- Labels -->
    <text x="110" y="125" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.4)">Hukum Newton &amp; Gerak Parabola</text>
  </svg>`,
  5: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#1A0A2E"/>
    <!-- Lab bench -->
    <rect x="0" y="108" width="280" height="32" fill="#2D1B69"/>
    <!-- Beaker 1 (blue - base) -->
    <path d="M 40 108 L 48 60 L 82 60 L 90 108 Z" fill="rgba(30,136,229,0.3)" stroke="#1E88E5" stroke-width="1.5"/>
    <path d="M 44 108 L 51 68 L 79 68 L 86 108 Z" fill="rgba(30,136,229,0.2)"/>
    <ellipse cx="65" cy="60" rx="17" ry="5" fill="none" stroke="#1E88E5" stroke-width="1.5"/>
    <ellipse cx="65" cy="84" rx="12" ry="3" fill="#1E88E5" opacity="0.5"/>
    <!-- Beaker 2 (red - acid) -->
    <path d="M 120" y="108" L 128 65 L 162 65 L 170 108 Z" fill="rgba(229,57,53,0.3)" stroke="#E53935" stroke-width="1.5"/>
    <path d="M 120 108 L 128 65 L 162 65 L 170 108 Z" fill="rgba(229,57,53,0.3)" stroke="#E53935" stroke-width="1.5"/>
    <ellipse cx="145" cy="65" rx="17" ry="5" fill="none" stroke="#E53935" stroke-width="1.5"/>
    <ellipse cx="145" cy="88" rx="12" ry="3" fill="#E53935" opacity="0.5"/>
    <!-- Bubbles -->
    <circle cx="145" cy="78" r="2.5" fill="rgba(255,255,255,0.2)"/>
    <circle cx="140" cy="72" r="1.5" fill="rgba(255,255,255,0.2)"/>
    <circle cx="150" cy="70" r="2" fill="rgba(255,255,255,0.2)"/>
    <!-- Reaction beaker (green) -->
    <path d="M 200 108 L 208 55 L 252 55 L 260 108 Z" fill="rgba(76,175,80,0.3)" stroke="#4CAF50" stroke-width="1.5"/>
    <ellipse cx="230" cy="55" rx="22" ry="6" fill="none" stroke="#4CAF50" stroke-width="1.5"/>
    <!-- Reaction sparkles -->
    <circle cx="220" cy="75" r="3" fill="#FFF176" opacity="0.8"/>
    <circle cx="235" cy="68" r="2" fill="#FFF176" opacity="0.6"/>
    <circle cx="245" cy="78" r="2.5" fill="#FFF176" opacity="0.7"/>
    <text x="230" y="95" text-anchor="middle" font-size="8" fill="#A5D6A7">H₂O + NaCl</text>
    <!-- Labels -->
    <text x="65" y="125" text-anchor="middle" font-size="8" fill="#90CAF9">Basa</text>
    <text x="145" y="125" text-anchor="middle" font-size="8" fill="#EF9A9A">Asam</text>
    <text x="230" y="125" text-anchor="middle" font-size="8" fill="#A5D6A7">Garam</text>
    <!-- Plus and arrow -->
    <text x="105" y="88" text-anchor="middle" font-size="16" fill="rgba(255,255,255,0.3)">+</text>
    <text x="183" y="88" text-anchor="middle" font-size="14" fill="rgba(255,255,255,0.3)">→</text>
  </svg>`,
  6: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#050A1A"/>
    <!-- Stars -->
    <g fill="white" opacity="0.7">
      <circle cx="15" cy="12" r="1"/><circle cx="45" cy="8" r="1.5"/><circle cx="90" cy="15" r="1"/><circle cx="130" cy="5" r="1"/><circle cx="175" cy="18" r="1.5"/><circle cx="220" cy="8" r="1"/><circle cx="255" cy="14" r="1"/><circle cx="270" cy="30" r="1"/>
      <circle cx="25" cy="45" r="1"/><circle cx="60" cy="35" r="1"/><circle cx="200" cy="40" r="1.5"/><circle cx="245" cy="55" r="1"/>
    </g>
    <!-- Sun (center) -->
    <circle cx="140" cy="72" r="18" fill="#FFF176"/>
    <circle cx="140" cy="72" r="22" fill="none" stroke="#FFF176" stroke-width="1" opacity="0.3"/>
    <circle cx="140" cy="72" r="26" fill="none" stroke="#FFF176" stroke-width="0.5" opacity="0.15"/>
    <!-- Orbits -->
    <ellipse cx="140" cy="72" rx="40" ry="10" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
    <ellipse cx="140" cy="72" rx="65" ry="18" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <ellipse cx="140" cy="72" rx="90" ry="26" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <!-- Mercury -->
    <circle cx="180" cy="72" r="4" fill="#B0BEC5"/>
    <!-- Venus -->
    <circle cx="135" cy="54" r="5" fill="#FFCC80"/>
    <!-- Earth -->
    <circle cx="60" cy="68" r="6" fill="#1E88E5"/>
    <ellipse cx="60" cy="67" rx="3" ry="2" fill="#4CAF50" opacity="0.8"/>
    <!-- Mars -->
    <circle cx="165" cy="95" r="5" fill="#EF5350"/>
    <!-- Text -->
    <text x="140" y="128" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.4)">Tata Surya · Gravitasi &amp; Planet</text>
  </svg>`,
  7: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#1A1A2E"/>
    <!-- Truth table -->
    <rect x="20" y="18" width="110" height="90" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <rect x="20" y="18" width="110" height="22" rx="6" fill="rgba(255,255,255,0.12)"/>
    <text x="46" y="33" text-anchor="middle" font-size="10" font-weight="bold" fill="#B0BEC5">P</text>
    <text x="75" y="33" text-anchor="middle" font-size="10" font-weight="bold" fill="#B0BEC5">Q</text>
    <text x="108" y="33" text-anchor="middle" font-size="10" font-weight="bold" fill="#80DEEA">P∧Q</text>
    <!-- Rows -->
    <text x="46" y="52" text-anchor="middle" font-size="11" fill="#EF5350">T</text><text x="75" y="52" text-anchor="middle" font-size="11" fill="#EF5350">T</text><text x="108" y="52" text-anchor="middle" font-size="11" fill="#66BB6A">T</text>
    <text x="46" y="68" text-anchor="middle" font-size="11" fill="#EF5350">T</text><text x="75" y="68" text-anchor="middle" font-size="11" fill="#B0BEC5">F</text><text x="108" y="68" text-anchor="middle" font-size="11" fill="#EF5350">F</text>
    <text x="46" y="84" text-anchor="middle" font-size="11" fill="#B0BEC5">F</text><text x="75" y="84" text-anchor="middle" font-size="11" fill="#EF5350">T</text><text x="108" y="84" text-anchor="middle" font-size="11" fill="#EF5350">F</text>
    <text x="46" y="100" text-anchor="middle" font-size="11" fill="#B0BEC5">F</text><text x="75" y="100" text-anchor="middle" font-size="11" fill="#B0BEC5">F</text><text x="108" y="100" text-anchor="middle" font-size="11" fill="#EF5350">F</text>
    <!-- Logic gate -->
    <rect x="155" y="45" width="100" height="44" rx="8" fill="rgba(100,181,246,0.1)" stroke="#64B5F6" stroke-width="1.5"/>
    <text x="205" y="65" text-anchor="middle" font-size="13" font-weight="bold" fill="#64B5F6">AND</text>
    <text x="205" y="80" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.4)">Logic Gate</text>
    <!-- Wires -->
    <line x1="130" y1="57" x2="155" y2="57" stroke="#64B5F6" stroke-width="1.5"/>
    <line x1="130" y1="75" x2="155" y2="75" stroke="#64B5F6" stroke-width="1.5"/>
    <line x1="255" y1="67" x2="275" y2="67" stroke="#64B5F6" stroke-width="1.5"/>
    <circle cx="275" cy="67" r="4" fill="#66BB6A"/>
    <text x="140" y="118" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.35)">Logika Matematika · Proposisi</text>
  </svg>`,
  8: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#003300"/>
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0277BD" stop-opacity="0.8"/>
        <stop offset="60%" stop-color="#81C784" stop-opacity="0.2"/>
      </linearGradient>
    </defs>
    <rect width="280" height="140" fill="url(#skyGrad)"/>
    <!-- Sun rays for photosynthesis -->
    <circle cx="240" cy="22" r="14" fill="#FFF176" opacity="0.9"/>
    <!-- Leaf shape -->
    <path d="M 80 110 Q 40 60 80 30 Q 140 10 160 60 Q 170 90 80 110 Z" fill="#2E7D32" stroke="#1B5E20" stroke-width="1.5"/>
    <path d="M 80 110 Q 80 70 100 50" stroke="#A5D6A7" stroke-width="1.5" fill="none"/>
    <path d="M 100 50 Q 115 60 120 80" stroke="#A5D6A7" stroke-width="1" fill="none"/>
    <path d="M 100 50 Q 90 65 85 80" stroke="#A5D6A7" stroke-width="1" fill="none"/>
    <!-- Arrow sunlight -->
    <line x1="220" y1="35" x2="165" y2="58" stroke="#FFF176" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>
    <!-- CO2 input -->
    <rect x="170" y="82" width="40" height="18" rx="5" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="190" y="94" text-anchor="middle" font-size="9" fill="#B0BEC5">CO₂</text>
    <line x1="170" y1="91" x2="155" y2="82" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <!-- O2 output -->
    <rect x="170" y="55" width="40" height="18" rx="5" fill="rgba(100,200,100,0.15)" stroke="#81C784" stroke-width="1"/>
    <text x="190" y="67" text-anchor="middle" font-size="9" fill="#A5D6A7">O₂</text>
    <line x1="170" y1="64" x2="158" y2="62" stroke="#81C784" stroke-width="1"/>
    <!-- Glucose -->
    <rect x="10" y="78" width="52" height="18" rx="5" fill="rgba(255,193,7,0.15)" stroke="#FFC107" stroke-width="1"/>
    <text x="36" y="90" text-anchor="middle" font-size="9" fill="#FFF176">C₆H₁₂O₆</text>
    <text x="140" y="128" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.4)">Fotosintesis · 6CO₂+6H₂O → Glukosa</text>
  </svg>`,
  9: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#0D0D1A"/>
    <!-- Wave 1 -->
    <path d="M 10 55 Q 30 25 50 55 Q 70 85 90 55 Q 110 25 130 55 Q 150 85 170 55 Q 190 25 210 55 Q 230 85 250 55 Q 270 25 280 45" stroke="#64B5F6" stroke-width="2.5" fill="none"/>
    <!-- Wave 2 (lower freq) -->
    <path d="M 10 90 Q 50 60 90 90 Q 130 120 170 90 Q 210 60 250 90" stroke="#CE93D8" stroke-width="2" fill="none" opacity="0.7"/>
    <!-- Amplitude arrow -->
    <line x1="30" y1="55" x2="30" y2="25" stroke="#FFA726" stroke-width="1.5" stroke-dasharray="3,2"/>
    <line x1="26" y1="28" x2="34" y2="28" stroke="#FFA726" stroke-width="1.5"/>
    <text x="12" y="42" font-size="8" fill="#FFA726">A</text>
    <!-- Wavelength arrow -->
    <line x1="10" y1="105" x2="90" y2="105" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    <text x="50" y="116" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.4)">λ</text>
    <!-- Frequency indicator -->
    <rect x="195" y="15" width="76" height="36" rx="6" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="233" y="30" text-anchor="middle" font-size="9" fill="#80DEEA">f = 440 Hz</text>
    <text x="233" y="44" text-anchor="middle" font-size="9" fill="#CE93D8">λ = 0.78 m</text>
    <!-- Note symbol -->
    <text x="240" y="95" font-size="28" fill="rgba(255,255,255,0.1)">♪</text>
    <text x="140" y="132" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.3)">Gelombang · Frekuensi · Amplitudo</text>
  </svg>`,
  10: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#1A0C00"/>
    <!-- Parchment texture bg -->
    <rect x="10" y="10" width="260" height="120" rx="8" fill="#D7B896" opacity="0.12" stroke="#A0896A" stroke-width="0.5"/>
    <!-- Timeline line -->
    <line x1="30" y1="75" x2="250" y2="75" stroke="#A0896A" stroke-width="2"/>
    <!-- Era dots and labels -->
    <circle cx="55" cy="75" r="8" fill="#EF6C00" stroke="#BF360C" stroke-width="1.5"/>
    <text x="55" y="79" text-anchor="middle" font-size="8" font-weight="bold" fill="white">I</text>
    <text x="55" y="60" text-anchor="middle" font-size="7" fill="#FFCC80">Kuno</text>
    <circle cx="110" cy="75" r="8" fill="#6A1B9A" stroke="#4A148C" stroke-width="1.5"/>
    <text x="110" y="79" text-anchor="middle" font-size="7" font-weight="bold" fill="white">II</text>
    <text x="110" y="60" text-anchor="middle" font-size="7" fill="#CE93D8">Klasik</text>
    <circle cx="165" cy="75" r="8" fill="#1565C0" stroke="#0D47A1" stroke-width="1.5"/>
    <text x="165" y="79" text-anchor="middle" font-size="7" font-weight="bold" fill="white">III</text>
    <text x="165" y="60" text-anchor="middle" font-size="7" fill="#90CAF9">Medieval</text>
    <circle cx="220" cy="75" r="8" fill="#2E7D32" stroke="#1B5E20" stroke-width="1.5"/>
    <text x="220" y="79" text-anchor="middle" font-size="7" font-weight="bold" fill="white">IV</text>
    <text x="220" y="60" text-anchor="middle" font-size="7" fill="#A5D6A7">Modern</text>
    <!-- Small decoration -->
    <text x="55" y="100" text-anchor="middle" font-size="16" fill="rgba(255,140,0,0.3)">🏛</text>
    <text x="165" y="100" text-anchor="middle" font-size="14" fill="rgba(100,149,237,0.3)">⚔</text>
    <text x="220" y="100" text-anchor="middle" font-size="14" fill="rgba(100,200,100,0.3)">⚙</text>
    <text x="140" y="125" text-anchor="middle" font-size="9" fill="rgba(255,200,130,0.4)">Sejarah Peradaban Dunia</text>
  </svg>`,
  11: `<svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="140" fill="#050510"/>
    <!-- Neural network nodes -->
    <!-- Layer 1 (input) -->
    <circle cx="40" cy="35" r="10" fill="rgba(100,181,246,0.2)" stroke="#64B5F6" stroke-width="1.5"/>
    <circle cx="40" cy="70" r="10" fill="rgba(100,181,246,0.2)" stroke="#64B5F6" stroke-width="1.5"/>
    <circle cx="40" cy="105" r="10" fill="rgba(100,181,246,0.2)" stroke="#64B5F6" stroke-width="1.5"/>
    <!-- Layer 2 (hidden) -->
    <circle cx="110" cy="25" r="10" fill="rgba(206,147,216,0.2)" stroke="#CE93D8" stroke-width="1.5"/>
    <circle cx="110" cy="55" r="10" fill="rgba(206,147,216,0.2)" stroke="#CE93D8" stroke-width="1.5"/>
    <circle cx="110" cy="85" r="10" fill="rgba(206,147,216,0.2)" stroke="#CE93D8" stroke-width="1.5"/>
    <circle cx="110" cy="115" r="10" fill="rgba(206,147,216,0.2)" stroke="#CE93D8" stroke-width="1.5"/>
    <!-- Layer 3 (hidden 2) -->
    <circle cx="180" cy="40" r="10" fill="rgba(128,222,234,0.2)" stroke="#80DEEA" stroke-width="1.5"/>
    <circle cx="180" cy="70" r="10" fill="rgba(128,222,234,0.2)" stroke="#80DEEA" stroke-width="1.5"/>
    <circle cx="180" cy="100" r="10" fill="rgba(128,222,234,0.2)" stroke="#80DEEA" stroke-width="1.5"/>
    <!-- Layer 4 (output) -->
    <circle cx="245" cy="55" r="12" fill="rgba(255,241,118,0.2)" stroke="#FFF176" stroke-width="2"/>
    <circle cx="245" cy="90" r="12" fill="rgba(255,241,118,0.2)" stroke="#FFF176" stroke-width="2"/>
    <!-- Connections (selected) -->
    <g stroke="rgba(100,181,246,0.15)" stroke-width="0.8">
      <line x1="50" y1="35" x2="100" y2="25"/><line x1="50" y1="35" x2="100" y2="55"/><line x1="50" y1="35" x2="100" y2="85"/>
      <line x1="50" y1="70" x2="100" y2="25"/><line x1="50" y1="70" x2="100" y2="55"/><line x1="50" y1="70" x2="100" y2="85"/><line x1="50" y1="70" x2="100" y2="115"/>
      <line x1="50" y1="105" x2="100" y2="55"/><line x1="50" y1="105" x2="100" y2="85"/><line x1="50" y1="105" x2="100" y2="115"/>
    </g>
    <g stroke="rgba(206,147,216,0.2)" stroke-width="0.8">
      <line x1="120" y1="25" x2="170" y2="40"/><line x1="120" y1="55" x2="170" y2="40"/><line x1="120" y1="55" x2="170" y2="70"/><line x1="120" y1="85" x2="170" y2="70"/><line x1="120" y1="85" x2="170" y2="100"/><line x1="120" y1="115" x2="170" y2="100"/>
    </g>
    <g stroke="rgba(128,222,234,0.3)" stroke-width="1">
      <line x1="190" y1="40" x2="233" y2="55"/><line x1="190" y1="70" x2="233" y2="55"/><line x1="190" y1="70" x2="233" y2="90"/><line x1="190" y1="100" x2="233" y2="90"/>
    </g>
    <!-- AI text -->
    <text x="140" y="128" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.3)">Neural Network · Machine Learning</text>
  </svg>`,
};

export const MODULES_DATA: Module[] = [
  {
    id: 1,
    title: 'Pengenalan Sistem Bilangan',
    desc: 'Memahami sistem bilangan biner, oktal, dan heksadesimal dalam kehidupan sehari-hari.',
    status: 'unlocked',
    material: {
      objectives: [
        'Memahami konsep sistem bilangan biner (basis 2)',
        'Mengkonversi bilangan desimal ke biner dan sebaliknya',
        'Mengenal sistem bilangan oktal (basis 8) dan heksadesimal (basis 16)',
        'Menerapkan sistem bilangan dalam konteks komputer dan teknologi',
      ],
      theory: `<p>Komputer hanya mengenal dua keadaan: <strong>menyala (1)</strong> dan <strong>mati (0)</strong>. Inilah dasar dari <strong>sistem bilangan biner</strong> yang menjadi fondasi seluruh dunia digital.</p>
<p>Ada empat sistem bilangan utama yang perlu kamu ketahui:</p>
<ul>
  <li><strong>Desimal (basis 10):</strong> Sistem sehari-hari dengan angka 0–9. Contoh: 13</li>
  <li><strong>Biner (basis 2):</strong> Hanya angka 0 dan 1. Contoh: 1101₂ = 13</li>
  <li><strong>Oktal (basis 8):</strong> Angka 0–7. Contoh: 15₈ = 13</li>
  <li><strong>Heksadesimal (basis 16):</strong> Angka 0–9 dan huruf A–F. Contoh: D₁₆ = 13</li>
</ul>
<p><strong>Cara konversi desimal → biner:</strong> Bagi angka dengan 2 berulang kali, catat sisanya dari bawah ke atas. Contoh: 13 ÷ 2 = 6 sisa 1 → 6 ÷ 2 = 3 sisa 0 → 3 ÷ 2 = 1 sisa 1 → 1 ÷ 2 = 0 sisa 1. Hasilnya: <strong>1101</strong>.</p>`,
      keyTerms: [
        { term: 'Bit', def: 'Satuan terkecil data komputer, bernilai 0 atau 1' },
        { term: 'Byte', def: '8 bit yang membentuk satu karakter/data' },
        { term: 'Basis', def: 'Jumlah simbol unik dalam suatu sistem bilangan' },
      ],
    },
    games: [
      { id: 1, title: 'Konversi Bilangan Biner', desc: 'Latihan mengkonversi bilangan desimal ke biner.' },
      { id: 2, title: 'Hitung Cepat Oktal', desc: 'Simulasi kalkulator bilangan oktal interaktif.' },
    ],
    duration: '45 menit',
    level: 'SD – SMP',
    gameCount: 2,
  },
  {
    id: 2,
    title: 'Rangkaian Listrik Dasar',
    desc: 'Simulasi rangkaian seri dan paralel menggunakan komponen virtual.',
    status: 'locked',
    material: {
      objectives: [
        'Memahami perbedaan rangkaian seri dan paralel',
        'Menerapkan Hukum Ohm (V = I × R)',
        'Mengukur tegangan dan arus pada tiap komponen',
        'Memahami konsep hambatan total dalam rangkaian',
      ],
      theory: `<p>Listrik mengalir seperti air dalam pipa. Ada dua cara menyusun komponen listrik:</p>
<p><strong>Rangkaian Seri:</strong> Komponen disambung berurutan. Arus yang mengalir sama di semua komponen, tetapi tegangan terbagi. Jika satu komponen mati, seluruh rangkaian mati.</p>
<p><strong>Rangkaian Paralel:</strong> Komponen disambung sejajar. Tegangan sama di semua komponen, tetapi arus terbagi. Jika satu komponen mati, komponen lain tetap menyala.</p>
<p><strong>Hukum Ohm:</strong> V = I × R, di mana V = tegangan (Volt), I = arus (Ampere), R = hambatan (Ohm). Hukum ini berlaku untuk setiap komponen resistif.</p>`,
      keyTerms: [
        { term: 'Tegangan (V)', def: 'Beda potensial listrik, diukur dalam Volt' },
        { term: 'Arus (I)', def: 'Aliran muatan listrik, diukur dalam Ampere' },
        { term: 'Hambatan (R)', def: 'Penghambat aliran arus, diukur dalam Ohm (Ω)' },
      ],
    },
    games: [
      { id: 1, title: 'Rangkaian Seri', desc: 'Rakit komponen listrik seri dan ukur tegangan.' },
      { id: 2, title: 'Rangkaian Paralel', desc: 'Eksplorasi distribusi arus di rangkaian paralel.' },
    ],
    duration: '60 menit',
    level: 'SMP – SMA',
    gameCount: 2,
  },
  {
    id: 3,
    title: 'Ekosistem & Rantai Makanan',
    desc: 'Memahami hubungan produsen, konsumen, dan dekomposer dalam ekosistem.',
    status: 'locked',
    material: {
      objectives: [
        'Memahami komponen biotik dan abiotik dalam ekosistem',
        'Menjelaskan peran produsen, konsumen, dan dekomposer',
        'Menyusun rantai makanan dan jaring-jaring makanan',
        'Memahami aliran energi dalam ekosistem',
      ],
      theory: `<p>Ekosistem adalah sistem yang terbentuk dari makhluk hidup (biotik) dan lingkungan tak hidup (abiotik) yang saling berinteraksi.</p>
<p><strong>Komponen Ekosistem:</strong></p>
<ul>
  <li><strong>Produsen:</strong> Tumbuhan yang membuat makanan sendiri melalui fotosintesis</li>
  <li><strong>Konsumen I:</strong> Hewan pemakan tumbuhan (herbivora) seperti kelinci, belalang</li>
  <li><strong>Konsumen II:</strong> Hewan pemakan herbivora (karnivora) seperti rubah, katak</li>
  <li><strong>Dekomposer:</strong> Pengurai (jamur, bakteri) yang menguraikan sisa organisme</li>
</ul>
<p><strong>Rantai makanan</strong> menggambarkan aliran energi dari satu organisme ke organisme lain. Energi berkurang sekitar 90% di tiap tingkat trofik.</p>`,
      keyTerms: [
        { term: 'Trofik', def: 'Tingkatan dalam rantai makanan berdasarkan sumber energi' },
        { term: 'Biotik', def: 'Komponen hidup dalam ekosistem (hewan, tumbuhan, mikroba)' },
        { term: 'Abiotik', def: 'Komponen tak hidup (air, udara, tanah, cahaya matahari)' },
      ],
    },
    games: [
      { id: 1, title: 'Rantai Makanan Builder', desc: 'Susun rantai makanan yang benar dari organisme.' },
    ],
    duration: '40 menit',
    level: 'SD – SMP',
    gameCount: 1,
  },
  {
    id: 4,
    title: 'Gerak & Gaya Newton',
    desc: 'Simulasi hukum Newton dalam berbagai kondisi fisika nyata.',
    status: 'locked',
    material: {
      objectives: [
        'Memahami tiga Hukum Newton tentang gerak',
        'Menghitung gaya, massa, dan percepatan dengan rumus F = ma',
        'Menganalisis gerak parabola dan komponen kecepatannya',
        'Menerapkan konsep gerak dalam situasi nyata',
      ],
      theory: `<p>Isaac Newton merumuskan tiga hukum gerak yang menjadi fondasi mekanika klasik:</p>
<p><strong>Hukum I Newton (Inersia):</strong> Benda diam tetap diam dan benda bergerak tetap bergerak lurus beraturan selama tidak ada gaya luar yang bekerja padanya.</p>
<p><strong>Hukum II Newton:</strong> Gaya = massa × percepatan (F = m·a). Semakin besar gaya, semakin besar percepatan. Semakin besar massa, semakin kecil percepatan untuk gaya yang sama.</p>
<p><strong>Hukum III Newton (Aksi-Reaksi):</strong> Setiap gaya aksi selalu menghasilkan gaya reaksi yang sama besar namun berlawanan arah.</p>
<p><strong>Gerak Parabola:</strong> Gabungan gerak horizontal (konstan) dan vertikal (dipengaruhi gravitasi g ≈ 9,8 m/s²).</p>`,
      keyTerms: [
        { term: 'Inersia', def: 'Kecenderungan benda untuk mempertahankan keadaan geraknya' },
        { term: 'Percepatan', def: 'Perubahan kecepatan per satuan waktu (m/s²)' },
        { term: 'Gravitasi (g)', def: 'Percepatan gravitasi Bumi ≈ 9,8 m/s² ke arah bawah' },
      ],
    },
    games: [
      { id: 1, title: 'Gerak Parabola', desc: 'Simulasi peluru dan gravitasi.' },
      { id: 2, title: 'Hukum Newton', desc: 'Uji F=ma dengan berbagai massa dan gaya.' },
    ],
    duration: '50 menit',
    level: 'SMP – SMA',
    gameCount: 2,
  },
  {
    id: 5,
    title: 'Reaksi Kimia Sederhana',
    desc: 'Eksperimen kimia virtual: asam, basa, dan garam dalam laboratorium digital.',
    status: 'locked',
    material: {
      objectives: [
        'Memahami sifat larutan asam, basa, dan netral',
        'Menentukan pH menggunakan skala pH (0–14)',
        'Memahami reaksi netralisasi asam + basa → garam + air',
        'Mengidentifikasi contoh asam dan basa dalam kehidupan sehari-hari',
      ],
      theory: `<p>Materi kimia dapat dibedakan berdasarkan sifat keasamannya menggunakan <strong>skala pH</strong> (0–14):</p>
<ul>
  <li><strong>Asam (pH &lt; 7):</strong> Berasa masam, korosif. Contoh: cuka (pH 3), jeruk (pH 4), asam lambung (pH 2)</li>
  <li><strong>Netral (pH = 7):</strong> Air murni</li>
  <li><strong>Basa (pH &gt; 7):</strong> Terasa licin, pahit. Contoh: sabun (pH 9), soda kue (pH 8,3), pemutih (pH 12)</li>
</ul>
<p><strong>Reaksi Netralisasi:</strong> Ketika asam bereaksi dengan basa, dihasilkan garam dan air.</p>
<p>Contoh: HCl + NaOH → NaCl + H₂O (asam klorida + natrium hidroksida → garam dapur + air)</p>`,
      keyTerms: [
        { term: 'pH', def: 'Ukuran keasaman/kebasaan larutan (0=sangat asam, 14=sangat basa)' },
        { term: 'Indikator', def: 'Zat yang berubah warna sesuai pH larutan (misal: lakmus)' },
        { term: 'Netralisasi', def: 'Reaksi asam + basa yang menghasilkan garam dan air' },
      ],
    },
    games: [
      { id: 1, title: 'Lab Asam-Basa', desc: 'Campurkan larutan dan amati reaksinya.' },
      { id: 2, title: 'Pembentukan Garam', desc: 'Simulasi netralisasi asam dan basa.' },
    ],
    duration: '55 menit',
    level: 'SMP – SMA',
    gameCount: 2,
  },
  {
    id: 6,
    title: 'Sistem Tata Surya',
    desc: 'Jelajahi planet-planet dalam tata surya dan pahami gravitasi antariksa.',
    status: 'locked',
    material: {
      objectives: [
        'Mengenal urutan 8 planet dalam tata surya',
        'Memahami hukum gravitasi Newton dalam konteks antariksa',
        'Membedakan planet dalam (terestrial) dan planet luar (jovian)',
        'Memahami karakteristik unik setiap planet',
      ],
      theory: `<p>Tata Surya kita terdiri dari Matahari dan semua benda langit yang mengorbit di sekitarnya. Matahari mengandung 99,86% massa total tata surya.</p>
<p><strong>8 Planet (urutan dari Matahari):</strong> Merkurius, Venus, Bumi, Mars (planet dalam/berbatu), Jupiter, Saturnus, Uranus, Neptunus (planet luar/gas raksasa).</p>
<p><strong>Gravitasi:</strong> Gaya tarik-menarik antara dua benda bermassa. Semakin besar massa dan semakin dekat jaraknya, semakin kuat gravitasinya. Rumus: F = G × (m₁ × m₂) / r²</p>
<p>Gravitasi Matahari yang kuat menjaga planet-planet tetap berorbit elliptis mengelilinginya (Hukum Kepler).</p>`,
      keyTerms: [
        { term: 'Orbit', def: 'Lintasan elips planet mengelilingi Matahari' },
        { term: 'Gravitasi', def: 'Gaya tarik antara dua benda bermassa' },
        { term: 'Periode Orbit', def: 'Waktu yang dibutuhkan planet untuk satu kali mengelilingi Matahari' },
      ],
    },
    games: [
      { id: 1, title: 'Penjelajah Planet', desc: 'Eksplorasi setiap planet dan orbitnya.' },
    ],
    duration: '45 menit',
    level: 'SD – SMA',
    gameCount: 1,
  },
  {
    id: 7,
    title: 'Logika Matematika',
    desc: 'Latihan proposisi, tabel kebenaran, dan penalaran logis.',
    status: 'locked',
    material: {
      objectives: [
        'Memahami konsep proposisi dan nilai kebenarannya',
        'Menerapkan operator logika: AND (∧), OR (∨), NOT (¬)',
        'Membuat dan menganalisis tabel kebenaran',
        'Memahami implikasi dan biimplikasi',
      ],
      theory: `<p><strong>Proposisi</strong> adalah pernyataan yang memiliki nilai benar (True/T) atau salah (False/F).</p>
<p><strong>Operator Logika Utama:</strong></p>
<ul>
  <li><strong>AND (∧):</strong> Benar hanya jika kedua proposisi benar. P∧Q = T hanya jika P=T dan Q=T</li>
  <li><strong>OR (∨):</strong> Benar jika minimal satu proposisi benar. P∨Q = F hanya jika P=F dan Q=F</li>
  <li><strong>NOT (¬):</strong> Membalik nilai kebenaran. ¬T = F, ¬F = T</li>
  <li><strong>IMPLIKASI (→):</strong> P→Q salah hanya jika P benar dan Q salah</li>
</ul>
<p><strong>Tabel Kebenaran</strong> mendaftarkan semua kemungkinan kombinasi nilai proposisi beserta hasilnya.</p>`,
      keyTerms: [
        { term: 'Proposisi', def: 'Pernyataan yang bernilai benar atau salah, tidak keduanya' },
        { term: 'Tautologi', def: 'Proposisi yang selalu bernilai benar dalam semua kondisi' },
        { term: 'Kontradiksi', def: 'Proposisi yang selalu bernilai salah dalam semua kondisi' },
      ],
    },
    games: [
      { id: 1, title: 'Tabel Kebenaran', desc: 'Bangun dan analisis tabel kebenaran.' },
      { id: 2, title: 'Gerbang Logika', desc: 'Simulasi AND, OR, NOT gate.' },
    ],
    duration: '60 menit',
    level: 'SMA',
    gameCount: 2,
  },
  {
    id: 8,
    title: 'Fotosintesis & Respirasi',
    desc: 'Simulasi proses fotosintesis dan respirasi seluler pada tumbuhan.',
    status: 'locked',
    material: {
      objectives: [
        'Memahami proses fotosintesis dan faktor-faktor yang mempengaruhinya',
        'Menjelaskan tahapan respirasi seluler (glikolisis, siklus Krebs, rantai transpor elektron)',
        'Membandingkan fotosintesis dan respirasi sebagai proses yang saling berkaitan',
        'Mengidentifikasi peran klorofil dalam penangkapan cahaya',
      ],
      theory: `<p><strong>Fotosintesis</strong> adalah proses tumbuhan membuat makanan sendiri menggunakan energi cahaya matahari.</p>
<p>Persamaan reaksi: 6CO₂ + 6H₂O + cahaya → C₆H₁₂O₆ + 6O₂</p>
<p>Proses ini terjadi di <strong>kloroplas</strong>, organel yang mengandung pigmen hijau bernama klorofil. Ada dua tahap: reaksi terang (di tilakoid) dan siklus Calvin (di stroma).</p>
<p><strong>Respirasi Seluler</strong> adalah proses pemecahan glukosa untuk menghasilkan energi (ATP) yang dapat digunakan sel.</p>
<p>Persamaan: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP</p>`,
      keyTerms: [
        { term: 'Klorofil', def: 'Pigmen hijau dalam kloroplas yang menyerap energi cahaya' },
        { term: 'ATP', def: 'Adenosin trifosfat — mata uang energi sel' },
        { term: 'Stomata', def: 'Pori-pori kecil di daun untuk pertukaran gas CO₂ dan O₂' },
      ],
    },
    games: [
      { id: 1, title: 'Simulasi Fotosintesis', desc: 'Kendalikan cahaya, CO₂, dan air.' },
    ],
    duration: '40 menit',
    level: 'SMP – SMA',
    gameCount: 1,
  },
  {
    id: 9,
    title: 'Gelombang & Bunyi',
    desc: 'Visualisasi gelombang mekanik, frekuensi, dan amplitudo secara interaktif.',
    status: 'locked',
    material: {
      objectives: [
        'Memahami karakteristik gelombang: frekuensi, amplitudo, dan panjang gelombang',
        'Membedakan gelombang transversal dan longitudinal',
        'Memahami fenomena interferensi, difraksi, dan resonansi',
        'Menjelaskan cara perambatan bunyi dan kecepatan bunyi',
      ],
      theory: `<p><strong>Gelombang</strong> adalah gangguan yang merambat membawa energi tanpa memindahkan materi.</p>
<p><strong>Karakteristik Gelombang:</strong></p>
<ul>
  <li><strong>Amplitudo (A):</strong> Simpangan maksimum dari posisi keseimbangan</li>
  <li><strong>Frekuensi (f):</strong> Jumlah getaran per detik, diukur dalam Hertz (Hz)</li>
  <li><strong>Panjang Gelombang (λ):</strong> Jarak satu siklus penuh gelombang</li>
  <li><strong>Kecepatan (v):</strong> v = f × λ</li>
</ul>
<p><strong>Bunyi</strong> adalah gelombang longitudinal yang memerlukan medium untuk merambat. Kecepatan bunyi di udara ≈ 340 m/s. Manusia dapat mendengar frekuensi 20 Hz – 20.000 Hz.</p>`,
      keyTerms: [
        { term: 'Frekuensi', def: 'Jumlah getaran per detik (Hz) — menentukan tinggi rendah nada' },
        { term: 'Amplitudo', def: 'Simpangan maksimum gelombang — menentukan keras lemah suara' },
        { term: 'Interferensi', def: 'Superposisi dua gelombang yang menghasilkan penguatan atau pelemahan' },
      ],
    },
    games: [
      { id: 1, title: 'Visualisasi Gelombang', desc: 'Atur frekuensi dan amplitudo.' },
      { id: 2, title: 'Interferensi Bunyi', desc: 'Dengarkan efek interferensi konstruktif.' },
    ],
    duration: '50 menit',
    level: 'SMP – SMA',
    gameCount: 2,
  },
  {
    id: 10,
    title: 'Sejarah Peradaban Dunia',
    desc: 'Perjalanan interaktif melalui peradaban kuno hingga era modern.',
    status: 'locked',
    material: {
      objectives: [
        'Memahami kronologi peradaban besar dunia dari masa prasejarah hingga modern',
        'Mengidentifikasi kontribusi peradaban Mesir, Yunani, Romawi, dan Asia',
        'Memahami faktor-faktor yang mendorong kemajuan dan keruntuhan peradaban',
        'Mengaitkan peristiwa sejarah dengan kondisi dunia saat ini',
      ],
      theory: `<p>Peradaban manusia berkembang dalam beberapa gelombang besar yang saling mempengaruhi:</p>
<ul>
  <li><strong>Peradaban Kuno (±3000–500 SM):</strong> Mesir (piramida, hieroglif), Mesopotamia (tulisan paku), Indus, Tiongkok Kuno</li>
  <li><strong>Era Klasik (500 SM – 500 M):</strong> Yunani (demokrasi, filsafat), Romawi (hukum, infrastruktur), Han China</li>
  <li><strong>Abad Pertengahan (500–1500 M):</strong> Kekhalifahan Islam (ilmu pengetahuan), Eropa feodal, Kekaisaran Mongol</li>
  <li><strong>Era Modern (1500 M – kini):</strong> Renaisans, Revolusi Industri, globalisme</li>
</ul>
<p>Setiap peradaban besar meninggalkan warisan berupa teknologi, seni, sistem hukum, atau cara berpikir yang masih relevan hingga hari ini.</p>`,
      keyTerms: [
        { term: 'Peradaban', def: 'Masyarakat maju dengan sistem sosial, budaya, dan teknologi terorganisir' },
        { term: 'Renaisans', def: 'Periode kebangkitan seni dan ilmu pengetahuan Eropa (abad 14–17)' },
        { term: 'Revolusi Industri', def: 'Transisi ke produksi manufaktur mesin di Inggris (abad 18–19)' },
      ],
    },
    games: [
      { id: 1, title: 'Linimasa Peradaban', desc: 'Jelajahi era dari Mesir Kuno hingga Modern.' },
    ],
    duration: '65 menit',
    level: 'SMP – SMA',
    gameCount: 1,
  },
  {
    id: 11,
    title: 'Kecerdasan Buatan & Teknologi',
    desc: 'Pengenalan konsep AI, machine learning, dan dampaknya bagi kehidupan.',
    status: 'locked',
    material: {
      objectives: [
        'Memahami konsep dasar Kecerdasan Buatan (Artificial Intelligence)',
        'Mengenal perbedaan Machine Learning, Deep Learning, dan AI tradisional',
        'Memahami cara kerja jaringan saraf tiruan (neural network)',
        'Mengidentifikasi penerapan AI dalam kehidupan sehari-hari',
      ],
      theory: `<p><strong>Kecerdasan Buatan (AI)</strong> adalah kemampuan mesin untuk meniru fungsi kognitif manusia seperti belajar, memecahkan masalah, dan pengambilan keputusan.</p>
<p><strong>Hierarki AI:</strong></p>
<ul>
  <li><strong>AI:</strong> Bidang ilmu komputer yang membuat mesin "cerdas"</li>
  <li><strong>Machine Learning:</strong> Subset AI — mesin belajar dari data tanpa diprogram secara eksplisit</li>
  <li><strong>Deep Learning:</strong> Subset ML — menggunakan jaringan saraf berlapis (neural network)</li>
</ul>
<p><strong>Neural Network</strong> terinspirasi dari otak manusia: terdiri dari neuron buatan yang terhubung dalam lapisan. Data masuk di lapisan input, diproses di lapisan tersembunyi, dan hasilnya keluar di lapisan output.</p>
<p>AI sudah ada di sekitar kita: rekomendasi YouTube, filter spam email, asisten suara, dan diagnosis medis.</p>`,
      keyTerms: [
        { term: 'Algoritma', def: 'Serangkaian instruksi langkah-demi-langkah untuk memecahkan masalah' },
        { term: 'Training Data', def: 'Data yang digunakan untuk melatih model machine learning' },
        { term: 'Neural Network', def: 'Model komputasi terinspirasi otak, terdiri dari neuron buatan berlapis' },
      ],
    },
    games: [
      { id: 1, title: 'Neural Network Dasar', desc: 'Visualisasi cara kerja jaringan saraf.' },
      { id: 2, title: 'Machine Learning 101', desc: 'Latih model sederhana secara interaktif.' },
    ],
    duration: '70 menit',
    level: 'SMA',
    gameCount: 2,
  },
];
