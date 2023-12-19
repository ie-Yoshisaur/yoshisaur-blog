export const cd = (args?: string[]): string => {
    let url = '';
    const arg = args[0].replace(/^(\.\/|~\/)/, '');
    switch (arg) {
        case 'blog':
            url = '/blog';
            break;
        case 'github':
            url = 'https://github.com/ie-Yoshisaur';
            break;
        case 'x_twitter':
            url = 'https://twitter.com/ie_Yoshisaur';
            break;
        case 'resume':
            url = '/resume.html';
            break;
        default:
            return `No such file or directory: ${args[0]}`;
    }
    window.location.href = url;
    return '';
};
