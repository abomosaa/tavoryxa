import type { Product } from './catalogue';
export function ProductArt({ product, className = '' }: { product: Product; className?: string }) {
  const c = product.color;
  return (
    <svg className={className} viewBox="0 0 400 350" aria-hidden="true" focusable="false">
      <ellipse cx="206" cy="288" rx="116" ry="12" fill="#292820" opacity=".08" />
      {product.kind === 'notebook' && (
        <g transform="rotate(-12 200 175)">
          <rect x="110" y="57" width="179" height="224" rx="5" fill="#e8decb" />
          <rect x="103" y="48" width="179" height="226" rx="5" fill={c} />
          <path d="M119 49v224" stroke="#783220" strokeWidth="3" />
          <rect x="146" y="95" width="95" height="54" fill="#f7f3eb" />
          <path d="M160 112h67m-67 12h45m-45 10h56" stroke="#a84932" strokeWidth="2" />
          <path d="M259 48v227" stroke="#61331e" strokeWidth="5" />
          <path d="M140 274v24l9-6 9 6v-24" fill="#e1b886" />
        </g>
      )}
      {product.kind === 'tray' && (
        <g>
          <rect x="65" y="116" width="277" height="145" rx="60" fill="#c19a7f" />
          <rect x="65" y="102" width="277" height="145" rx="60" fill={c} />
          <rect x="84" y="120" width="239" height="109" rx="44" fill="#cda88b" />
          <circle cx="151" cy="171" r="19" fill="none" stroke="#b99456" strokeWidth="5" />
          <path d="M164 187l33 29m-13-14 8-8m-2 14 8-8" stroke="#b99456" strokeWidth="5" />
          <rect
            x="234"
            y="139"
            width="42"
            height="64"
            rx="3"
            fill="#f5eede"
            transform="rotate(12 255 170)"
          />
        </g>
      )}
      {product.kind === 'pen' && (
        <g transform="rotate(36 200 175)">
          <rect x="187" y="55" width="27" height="210" rx="10" fill={c} />
          <rect x="190" y="59" width="4" height="185" rx="2" fill="#7c826b" />
          <path d="M187 256l13 35 14-35" fill="#bbab8f" />
          <path d="m196 280 4 11 4-11" fill="#292820" />
          <rect x="187" y="78" width="27" height="5" fill="#ba9b60" />
          <path d="M210 62h7v69" fill="none" stroke="#b59b65" strokeWidth="4" />
        </g>
      )}
      {product.kind === 'calendar' && (
        <g transform="rotate(-5 200 175)">
          <path d="m94 272 43-206h154l39 206" fill={c} />
          <rect x="106" y="79" width="188" height="175" rx="2" fill="#fffcf4" />
          <path d="M106 120h188" stroke="#e3dbcb" />
          <text x="130" y="109" fontSize="15" fill="#a5442d" fontFamily="serif">
            TAKE YOUR TIME
          </text>
          {Array.from({ length: 28 }, (_, i) => (
            <circle
              key={i}
              cx={126 + (i % 7) * 24}
              cy={145 + Math.floor(i / 7) * 25}
              r="3"
              fill={i === 12 ? '#a5442d' : '#d3cbbd'}
            />
          ))}
          {[133, 166, 199, 232, 265].map((x) => (
            <path
              key={x}
              d={`M${x} 70v21`}
              stroke="#69675d"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
        </g>
      )}
      {product.kind === 'cup' && (
        <g>
          <g strokeWidth="11" strokeLinecap="round">
            <path d="m174 170-17-113" stroke="#a5442d" />
            <path d="m206 161 12-119" stroke="#5c6552" />
            <path d="m225 164 34-99" stroke="#c49c5f" />
          </g>
          <path d="M132 132h142l-13 142q-58 18-116 0Z" fill={c} />
          <ellipse cx="203" cy="132" rx="71" ry="15" fill="#c0916e" />
          <path
            d="M151 145v122m16-120v126m18-125v127m18-127v129m18-130v127m18-129v125m17-128v121"
            stroke="#bc8e69"
            strokeWidth="4"
          />
        </g>
      )}
      {product.kind === 'clips' && (
        <g transform="rotate(-8 200 175)">
          <rect x="99" y="111" width="203" height="148" fill="#d1bf9b" />
          <rect x="99" y="91" width="203" height="148" fill="#eadac0" />
          <path d="M99 135h203" stroke="#c9b491" />
          {[143, 235].map((x, i) => (
            <g key={x} transform={`rotate(${i ? 15 : -15} ${x} 185)`}>
              <path
                d={`M${x} 204v-51q0-16 15-16t15 16v59q0 25-24 25t-24-25v-50`}
                fill="none"
                stroke={c}
                strokeWidth="5"
              />
            </g>
          ))}
        </g>
      )}
      {product.kind === 'mat' && (
        <g>
          <rect x="55" y="98" width="294" height="176" rx="13" fill="#637056" />
          <rect x="55" y="88" width="294" height="176" rx="13" fill={c} />
          <rect
            x="66"
            y="99"
            width="272"
            height="154"
            rx="9"
            fill="none"
            stroke="#9da78f"
            strokeDasharray="3 4"
          />
          <rect x="111" y="121" width="127" height="88" rx="4" fill="#f0e9db" />
          <path d="M123 139h100m-100 17h100m-100 17h70" stroke="#c7bbaa" strokeWidth="2" />
          <rect x="267" y="146" width="37" height="62" rx="18" fill="#d2cbbb" />
          <path d="M285 149v15" stroke="#ada696" strokeWidth="2" />
        </g>
      )}
      {product.kind === 'notes' && (
        <g transform="rotate(-9 200 175)">
          {['#64735e', '#d9bb8e', c].map((color, i) => (
            <g key={color} transform={`translate(${i * 29} ${i * -17})`}>
              <rect x="101" y="110" width="133" height="159" rx="3" fill="#e8ddcb" />
              <rect x="98" y="103" width="133" height="159" rx="3" fill={color} />
              <path d="M109 103v159" stroke="#292820" opacity=".2" />
              <rect x="132" y="130" width="66" height="29" fill="#f3eada" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
