import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Post {
    slug: string;
    title: string;
    date: string;
    tags: string[];
}

interface BlogProps {
    posts: Post[];
}

export default function Blog({ posts }: BlogProps) {
    const router = useRouter();
    const tag = router.query.tag as string;

    const filteredPosts = tag ? posts.filter(post => post.tags.includes(tag)) : posts;

    return (
        <div className='blog'>
            <Head>
                <title>Blog</title>
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
            </h1>
            {tag && <h2>Tag: {tag}</h2>}
            {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                    <div key={post.slug} className='blog-post'>
                        <Link href={`/blog/${post.slug}`}>
                            <div className='post-container'>
                                <div className='post-title'>{post.title}</div>
                                <div className='post-dots'></div>
                                <div className='post-date'>{post.date}</div>
                            </div>
                        </Link>
                    </div>
                ))
            ) : (
                <p>There are no posts with this tag.</p>
            )}
        </div>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const files = fs.readdirSync(path.join(process.cwd(), 'src/pages/blog')).filter((filename) => filename.endsWith('.md'));

    const posts = files.map((filename) => {
        const slug = filename.replace('.md', '');
        const markdownWithMetadata = fs
            .readFileSync(path.join(process.cwd(), 'src/pages/blog', filename))
            .toString();

        const { data } = matter(markdownWithMetadata);

        if (!data.title || !data.date || isNaN(new Date(data.date).getTime())) {
            return null;
        }

        return {
            slug,
            title: data.title,
            date: new Date(data.date).toISOString().split('T')[0],
            tags: data.tags || [],
        };
    }).filter(Boolean);

    return {
        props: {
            posts,
        },
    };
};
