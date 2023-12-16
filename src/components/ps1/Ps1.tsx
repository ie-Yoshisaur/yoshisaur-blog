import React from 'react';
import { useTheme } from '../../utils/themeProvider';

export const Ps1 = () => {
  const hostname = 'yoshisaur.net';
  const { theme } = useTheme();

  return (
    <div>
      <span
        style={{
          color: theme.yellow,
        }}
      >
        yoshisaur
      </span>
      <span
        style={{
          color: theme.white,
        }}
      >
        @
      </span>
      <span
        style={{
          color: theme.green,
        }}
      >
        {hostname}
      </span>
      <span
        style={{
          color: theme.white,
        }}
      >
        :$ ~
      </span>
    </div>
  );
};

export default Ps1;
