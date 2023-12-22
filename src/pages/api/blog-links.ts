import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default (req, res) => {
    const files = fs.readdirSync(path.join(process.cwd(), 'src/pages/blog')).filter(filename => filename.endsWith('.md'));

    const blogData = files.map(filename => {
        const slug = filename.replace('.md', '');
        const markdownWithMetadata = fs
            .readFileSync(path.join(process.cwd(), 'src/pages/blog', filename))
            .toString();

        const { data } = matter(markdownWithMetadata);

        return {
            slug,
            title: data.title,
            date: new Date(data.date).toISOString().split('T')[0],
            link: `<a href="/blog/${slug}">${data.title}</a>`
        };
    }).filter(Boolean);

    blogData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const blogLinks = blogData.map(data => data.link);

    res.status(200).json({ blogLinks });
};