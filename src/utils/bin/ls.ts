export const ls = async (args?: string[]): Promise<string> => {
    if (!args || !args.length) {
        return ` <a href="/blog">blog</a>   <a href="https://github.com/ie-Yoshisaur">github</a>    <a href="/resume.html">resume</a>    <a href="https://twitter.com/ie_Yoshisaur">x_twitter</a>`;
    } else {
        let url = '';
        const arg = args[0].replace(/^(\.\/|~\/)/, '');
        switch (arg) {
            case 'blog':
                const response = await fetch('/api/blog-links');
                const data = await response.json();
                return data.blogLinks.join('   ');
            case 'github':
                url = 'https://github.com/ie-Yoshisaur';
                window.location.href = url;
                break;
            case 'x_twitter':
                url = 'https://twitter.com/ie_Yoshisaur';
                window.location.href = url;
                break;
            case 'resume':
                url = '/resume.html';
                window.location.href = url;
                break;
            default:
                return `No such file or directory: ${args[0]}`;
        }
        return '';
    }
};