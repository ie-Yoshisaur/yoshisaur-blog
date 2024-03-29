import packageJson from '../../../package.json';

export const whoami = (args?: string[]): string => {
 return `

██╗   ██╗ ██████╗ ███████╗██╗  ██╗██╗███████╗ █████╗ ██╗   ██╗██████╗ 
╚██╗ ██╔╝██╔═══██╗██╔════╝██║  ██║██║██╔════╝██╔══██╗██║   ██║██╔══██╗
 ╚████╔╝ ██║   ██║███████╗███████║██║███████╗███████║██║   ██║██████╔╝
  ╚██╔╝  ██║   ██║╚════██║██╔══██║██║╚════██║██╔══██║██║   ██║██╔══██╗
   ██║   ╚██████╔╝███████║██║  ██║██║███████║██║  ██║╚██████╔╝██║  ██║
   ╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
   

<div style="font-size: 1.5em;">Introduction:</div>

I am a software engineer in Japan 🇯🇵.

I ♥ Rust 🦀, database implementation, and low level programming.

I'm a fast learner and a team player 🤝.

I'm always looking for new challenges and opportunities to grow 💪.

I can speak English because I graduated after studying for 3 years in Canada 🇨🇦 during high school.


<div style="font-size: 1.5em;">My work:</div>

<a href="https://github.com/ie-Yoshisaur/OxideDB">OxideDB</a>

  - A relational database written in Rust.

<a href="https://github.com/ie-Yoshisaur/i386-emu">i386-emu</a>

  - An emulator for the Intel 386(i386) CPU architecture witten in Rust.


Type 'help' to see list of available commands.
`;
};
