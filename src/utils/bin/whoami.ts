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

I can speak English because I spent 3 years in Canada 🇨🇦 during high school.


<div style="font-size: 1.5em;">My work:</div>

<a href="https://github.com/ie-Yoshisaur/OxideDB">OxideDB</a>

  - A relational database written in Rust.


<a href="/">yoshisaur.net</a>

  - My personal terminal-like website.
  - I forked this from <a href="https://term.m4tt72.com/">m4tt72</a> and modified it under the MIT license.
  - I have modified it to be able to post blogs by writing md files.

---

Type 'help' to see list of available commands.
`;
};
