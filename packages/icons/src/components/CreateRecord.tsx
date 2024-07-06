import * as React from 'react';
import type { SVGProps } from 'react';
const CreateRecord = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <rect width={24} height={24} fill="#2684FF" rx={3} />
      <path
        fill="#fff"
        d="M17.01 11.01h-4.02V6.99a.99.99 0 1 0-1.98 0v4.02H6.99a.99.99 0 1 0 0 1.98h4.02v4.02a.99.99 0 1 0 1.98 0v-4.02h4.02a.99.99 0 1 0 0-1.98"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <rect width={24} height={24} fill="#fff" rx={3} />
      </clipPath>
    </defs>
  </svg>
);
export default CreateRecord;
