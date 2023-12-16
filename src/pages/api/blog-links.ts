import fs from 'fs';
import path from 'path';

export default (req, res) => {
    const files = fs.readdirSync(path.join(process.cwd(), 'src/pages/blog')).filter(filename => filename.endsWith('.md'));
    const blogLinks = files.map(filename => {
        const nameWithoutExtension = filename.replace('.md', '');
        return `<a href="/blog/${nameWithoutExtension}">${nameWithoutExtension}</a>`;
    });
    res.status(200).json({ blogLinks });
};