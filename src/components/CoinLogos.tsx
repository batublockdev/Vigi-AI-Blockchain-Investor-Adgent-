import React from 'react';

export const BtcLogo: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#F7931A" />
    <path
      d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783-1.727-.43-.709 2.839c-.376-.086-.745-.17-1.104-.258l.002-.007-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.314-1.256-.314l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.716 2.875 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.705 2.828 1.728.43.717-2.868c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.535 2.147-4.151.986-5.323.695l.95-3.807c1.172.292 4.928.87 4.373 3.112zm.536-5.57c-.488 1.954-3.498.962-4.474.719l.86-3.45c.977.243 4.122.697 3.614 2.731z"
      fill="#FFFFFF"
    />
  </svg>
);

export const EthLogo: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#627EEA" />
    <g fill="#FFFFFF" fillRule="nonzero">
      <path d="M16.498 4v8.87l7.497 3.35z" fillOpacity="0.6" />
      <path d="M16.498 4L9 16.22l7.498-3.35z" />
      <path d="M16.498 21.968v6.027L24 17.616z" fillOpacity="0.6" />
      <path d="M16.498 27.995v-6.027L9 17.616z" />
      <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fillOpacity="0.2" />
      <path d="M9 16.22l7.498 4.353v-7.701z" fillOpacity="0.6" />
    </g>
  </svg>
);

export const UsdtLogo: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#26A17B" />
    <path
      d="M17.922 17.383c-.11.008-.68.04-1.636.04-.766 0-1.424-.03-1.603-.04-3.52-.162-6.143-.76-6.143-1.47 0-.71 2.624-1.31 6.143-1.47.18-.01.837-.04 1.603-.04.956 0 1.526.03 1.636.04 3.52.16 6.144.76 6.144 1.47 0 .71-2.624 1.308-6.144 1.47zm0-3.66v-2.04h5.275V8.5h-14.4v3.183h5.276v2.04c-4.045.2-7.07 1.02-7.07 2.008 0 .987 3.025 1.808 7.07 2.007v7.262h3.85v-7.262c4.045-.2 7.07-1.02 7.07-2.007 0-.988-3.025-1.808-7.07-2.008z"
      fill="#FFFFFF"
    />
  </svg>
);

export const WbrlLogo: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#009C3B" />
    <polygon points="16,6 27,16 16,26 5,16" fill="#FFDF00" />
    <circle cx="16" cy="16" r="5.5" fill="#002776" />
    <text x="16" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
      R$
    </text>
  </svg>
);

export const WarsLogo: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#74ACDF" />
    <rect x="0" y="11" width="32" height="10" fill="#FFFFFF" />
    <circle cx="16" cy="16" r="3" fill="#F6B40E" />
    <text x="16" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
      ARS
    </text>
  </svg>
);

export const CeloLogo: React.FC<{ className?: string }> = ({ className = 'h-7 w-7' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#35D07F" />
    <path
      d="M19.8 17.9c-2.3 0-4.1-1.8-4.1-4.1s1.8-4.1 4.1-4.1 4.1 1.8 4.1 4.1-1.8 4.1-4.1 4.1zm-7.6 4.3c-2.3 0-4.1-1.8-4.1-4.1s1.8-4.1 4.1-4.1 4.1 1.8 4.1 4.1-1.8 4.1-4.1 4.1z"
      stroke="#FFFFFF"
      strokeWidth="2.5"
      fill="none"
    />
  </svg>
);

export const MetaMaskLogo: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg className={className} viewBox="0 0 318.6 318.6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#E2761B" stroke="#E2761B" strokeMiterlimit="10" d="M274.1 35.5l-99.5 73.9L194 65.4z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="M44.4 35.5l98.7 74.6-18.4-44.7z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="M238.3 206.8l-28.5 43.1 56.4 15.6 16.3-58.1z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="M36 207.4l16.3 58.1 56.4-15.6-28.5-43.1z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="M102.7 130.8L81.1 163.4l56.5 2.5-1.9-40.7z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="M215.8 130.8l-37 25.2-1.9 40.7 56.5-2.5z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="M108.9 249.9l33.8-16.5-29.3-22.8z" />
    <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="M175.9 233.4l33.8 16.5-4.5-39.3z" />
    <path fill="#F6851B" stroke="#F6851B" strokeMiterlimit="10" d="M209.7 249.9l-33.8-16.5 2.9 23.3z" />
    <path fill="#F6851B" stroke="#F6851B" strokeMiterlimit="10" d="M139.8 256.7l2.9-23.3-33.8 16.5z" />
    <path fill="#C0AD9E" stroke="#C0AD9E" strokeMiterlimit="10" d="M174.5 178.5l1.9-40.7-37 25.2-22.7-32.2-40.4 46.4 61.3 32.7z" />
    <path fill="#161616" stroke="#161616" strokeMiterlimit="10" d="M108.9 249.9l29-22.8-29.3-22.8z" />
    <path fill="#161616" stroke="#161616" strokeMiterlimit="10" d="M175.9 233.4l29 22.8.3-45.6z" />
    <path fill="#763D16" stroke="#763D16" strokeMiterlimit="10" d="M178.8 256.7l-2.9-23.3-16.6 8.3-16.6-8.3-2.9 23.3 19.5 11.4z" />
  </svg>
);

export const CoinbaseLogo: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#0052FF" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8ZM14.2 12.8C13.4268 12.8 12.8 13.4268 12.8 14.2V17.8C12.8 18.5732 13.4268 19.2 14.2 19.2H17.8C18.5732 19.2 19.2 18.5732 19.2 17.8V14.2C19.2 13.4268 18.5732 12.8 17.8 12.8H14.2Z"
      fill="#FFFFFF"
    />
  </svg>
);
