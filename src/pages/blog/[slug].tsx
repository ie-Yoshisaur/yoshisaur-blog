import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import Head from 'next/head';
import Link from 'next/link';

interface PostProps {
    content: string;
    data: {
        title: string;
        date: string;
        filename: string;
    };
}

export default function Post({ content, data }: PostProps) {
    useEffect(() => {
        Prism.highlightAll();
    }, []);

    return (
        <div className="blog">
            <Head>
                <title>{data.title}</title>
            </Head>
            <h1 className="cite-title">
                <Link href="/">
                    yoshisaur.net
                </Link>
                :
                <Link href="/">
                    ~
                </Link>
                /
                <Link href="/blog">
                    blog
                </Link>
                /
                <Link href={`/blog/${data.filename}`}>
                    {data.filename}
                </Link>
            </h1>
            <br />
            <h2>{data.title}</h2>
            <p>{data.date}</p>
            <hr />
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <hr />
            <p>Thank you for reading. This post is witten by Yoshisaur.</p>
            <a href="https://github.com/ie-Yoshisaur">GitHub</a>
            <br />
            <a href="https://twitter.com/ie_Yoshisaur">X/Twitter</a>
        </div>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const files = fs.readdirSync(path.join(process.cwd(), 'src/pages/blog'));
    const paths = files.filter(filename => filename.endsWith('.md')).map(filename => ({
        params: { slug: filename.replace('.md', '') },
    }));

    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const markdownWithMetadata = fs
        .readFileSync(path.join(process.cwd(), 'src/pages/blog', params.slug + '.md'))
        .toString();

    const parsedMarkdown = matter(markdownWithMetadata);
    const content = await remark()
        .use(html)
        .use(gfm)
        .process(parsedMarkdown.content);

    const contentHtml = content.toString();

    return {
        props: {
            content: contentHtml,
            data: {
                title: parsedMarkdown.data.title,
                date: new Date(parsedMarkdown.data.date).toISOString().split('T')[0],
                filename: params.slug,
            },
        },
    };
};
