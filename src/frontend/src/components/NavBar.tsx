// src/components/NavBar.tsx

import React from 'react';

const NavBar: React.FC = () => {
  return (
    <nav className="bg-[#454545]">
      <ul className="flex text-[12px] md:text-[16px] py-[4px]">
        <li>
          <button className="px-3 text-green-400 rounded-full hover:bg-gray-600 transition duration-200">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://39iz3r3gr2o.typeform.com/to/m7n9oDwE"
            >
              Suggestions
            </a>
          </button>
        </li>
        <li>
          <button className="px-3 text-green-400 rounded-full hover:bg-gray-600 transition duration-200">
            Help
          </button>
        </li>
        <li>
          <button className="px-3 text-green-400 rounded-full hover:bg-gray-600 transition duration-200">
            AI Chat
          </button>
        </li>
        <li>
          <button className="px-3 text-green-400 rounded-full hover:bg-gray-600 transition duration-200">
            <a
              href="https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=jkmf4-caaaa-aaaal-amq3q-cai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Candid UI
            </a>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;

