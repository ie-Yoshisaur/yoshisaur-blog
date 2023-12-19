export const tree = async (args?: string[]): Promise<string> => {
    if (!args || !args.length) {
        const response = await fetch('/api/blog-links');
        const data = await response.json();
        const blogLinks = data.blogLinks.map((link, index, array) => {
            const prefix = index === array.length - 1 ? '└── ' : '├── ';
            return `    ${prefix}${link}\n`;
        }).join('');

        return `
.
├── <a href="https://github.com/ie-Yoshisaur">github</a>
├── <a href="https://twitter.com/ie_Yoshisaur">x_twitter</a>
├── <a href="/resume.html">resume</a>
└── <a href="/blog">blog</a>
${blogLinks}
`;
    } else {
        throw new Error('This tree command does not accept any arguments.');
    }
};
