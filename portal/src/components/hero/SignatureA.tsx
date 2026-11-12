import React from "react";

/**
 * Stationary Home Hero A symbol and route geometry from AstraFlow-Final-Craft-v12/index.html.
 * Geometry, position, and dimensions DO NOT MOVE. Only the orange signal dot follows its fixed path.
 */
export function SignatureA() {
  return (
    <div className="v10-svg-slot">
      <svg
        aria-label="AstraFlow A symbol with an animated orange request signal tracing its flow path"
        className="v10-logo-svg"
        role="img"
        viewBox="0 0 830 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="aFront" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#143e35" />
            <stop offset=".43" stopColor="#0b302a" />
            <stop offset="1" stopColor="#031d19" />
          </linearGradient>
          <linearGradient id="aSide" x1="0" x2="1" y1="0" y2=".8">
            <stop stopColor="#42695b" />
            <stop offset="1" stopColor="#05251f" />
          </linearGradient>
          <linearGradient id="routeGradient" x1="0" x2="1" y1=".2" y2=".9">
            <stop stopColor="#ffd7ad" />
            <stop offset=".45" stopColor="#ff8d51" />
            <stop offset="1" stopColor="#dc4826" />
          </linearGradient>
          <linearGradient id="routeTop" x1="0" x2=".6" y1="0" y2="1">
            <stop stopColor="#f6b07f" />
            <stop offset="1" stopColor="#d94f2d" />
          </linearGradient>
          <filter height="160%" id="floats" width="160%" x="-30%" y="-30%">
            <feDropShadow
              dx="0"
              dy="23"
              floodColor="#0b302a"
              floodOpacity=".19"
              stdDeviation="20"
            />
          </filter>
          <filter height="220%" id="routeGlow" width="220%" x="-60%" y="-60%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <pattern
            height="30"
            id="plotDots"
            patternUnits="userSpaceOnUse"
            width="30"
          >
            <circle cx="1" cy="1" fill="#144438" opacity=".20" r=".7" />
          </pattern>
        </defs>
        <rect
          fill="url(#plotDots)"
          height="600"
          opacity=".45"
          width="830"
          x="0"
          y="0"
        />
        <g
          className="stage-architecture"
          fill="none"
          opacity=".25"
          stroke="#4e6d5e"
          strokeWidth="1"
        >
          <circle cx="441" cy="290" r="216" strokeDasharray="3 11" />
          <circle cx="441" cy="290" r="146" />
          <path d="M52 98 H788 M52 496 H788 M82 56 V540 M770 56 V540" />
          <path d="M78 472 739 82 M104 114 727 491" opacity=".35" />
        </g>
        <g className="signature-a" filter="url(#floats)">
          <path
            d="M331 99 H448 L574 303 H477 L390 161 L242 405 C232 425 224 434 196 434 H111 Z"
            fill="#041c17"
            opacity=".13"
            transform="translate(13 22)"
          />
          <path
            d="M330 79 H452 L578 294 H479 L392 150 L245 388 C235 405 226 413 196 413 H112 Z"
            fill="url(#aSide)"
          />
          <path
            d="M330 79 H421 L537 264 H450 L386 157 L245 388 C235 405 226 413 196 413 H112 Z"
            fill="url(#aFront)"
          />
          <path
            d="M117 450 H280 C329 450 349 431 375 389 L424 310 C445 275 470 260 508 260 H640 L699 354 H520 C492 354 483 360 471 382 L415 472 C384 521 349 528 280 528 H69 Z"
            fill="#db3e24"
            opacity=".19"
            transform="translate(9 15)"
          />
          <path
            d="M117 450 H280 C329 450 349 431 375 389 L424 310 C445 275 470 260 508 260 H640 L685 333 H520 C492 333 483 345 471 367 L415 455 C384 501 349 510 280 510 H69 Z"
            fill="url(#routeGradient)"
          />
          <path
            d="M424 310 C445 275 470 260 508 260 H640 L685 333 H520 C492 333 483 345 471 367"
            fill="none"
            stroke="#fff5d7"
            strokeOpacity=".57"
            strokeWidth="2"
          />
          <path d="M596 382 H663 L714 464 H648 Z" fill="url(#aFront)" />
        </g>
        <path
          d="M54 471 C154 468 225 468 279 468 C355 468 368 439 408 375 C448 304 470 304 530 304 H643 C678 304 710 295 770 250"
          fill="none"
          filter="url(#routeGlow)"
          stroke="#f9ae80"
          strokeOpacity=".18"
          strokeWidth="12"
        />
        <path
          className="signature-route"
          d="M54 471 C154 468 225 468 279 468 C355 468 368 439 408 375 C448 304 470 304 530 304 H643 C678 304 710 295 770 250"
          fill="none"
          id="signature-route"
          stroke="#fff8d5"
          strokeDasharray="3 13"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
        <g className="signature-flow-dot">
          <circle fill="#f25d36" r="8" stroke="#fff7ed" strokeWidth="3">
            <animateMotion
              dur="7s"
              path="M54 471 C154 468 225 468 279 468 C355 468 368 439 408 375 C448 304 470 304 530 304 H643 C678 304 710 295 770 250"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>
        </g>
        <g
          className="plot-label"
          fill="#163c33"
          fontFamily="Inter, sans-serif"
          fontSize="13"
        >
          <rect
            fill="#fffaf3"
            height="40"
            rx="10"
            stroke="#dad6ca"
            width="135"
            x="15"
            y="418"
          />
          <circle cx="34" cy="438" fill="#d84c30" r="4" />
          <text x="48" y="443">REQUEST</text>
          <rect
            fill="#fffaf3"
            height="40"
            rx="10"
            stroke="#dad6ca"
            width="140"
            x="377"
            y="527"
          />
          <circle cx="397" cy="547" fill="#d84c30" r="4" />
          <text x="410" y="552">PIPELINE</text>
          <rect
            fill="#fffaf3"
            height="40"
            rx="10"
            stroke="#dad6ca"
            width="125"
            x="573"
            y="200"
          />
          <circle cx="594" cy="219" fill="#d84c30" r="4" />
          <text x="607" y="225">HANDLER</text>
          <rect fill="#08332a" height="40" rx="10" width="108" x="712" y="175" />
          <text fill="#fff4e9" x="729" y="200">
            RESULT ↗
          </text>
        </g>
        <g
          fill="none"
          opacity=".55"
          stroke="#225345"
          strokeDasharray="3 5"
          strokeWidth="1.3"
        >
          <path d="M147 439 H230 V469" />
          <path d="M449 527 V465" />
          <path d="M630 241 V304" />
          <path d="M767 216 V250" />
        </g>
        <g fill="#ed623e">
          <rect height="12" rx="2" width="12" x="225" y="461" />
          <rect height="12" rx="2" width="12" x="445" y="367" />
          <rect height="12" rx="2" width="12" x="643" y="296" />
        </g>
      </svg>
    </div>
  );
}
