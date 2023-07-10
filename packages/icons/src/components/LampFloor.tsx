import * as React from 'react';
import type { SVGProps } from 'react';
const LampFloor = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 2h6l3 7H6l3-7ZM12 9v13M9 22h6"
    />
  </svg>
);
export default LampFloor;
