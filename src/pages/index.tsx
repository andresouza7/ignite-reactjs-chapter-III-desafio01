import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { useState } from 'react';
import { format } from 'date-fns';
import enUS from 'date-fns/locale/pt-BR';
import { getPaginatedPosts, getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { prettifyDate } from '../util/prettifyDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

function mapPostPreview(responseResults): Post {
  return {
    uid: responseResults.uid,
    first_publication_date: responseResults.first_publication_date,
    data: {
      title: responseResults.data.title,
      subtitle: responseResults.data.subtitle,
      author: responseResults.data.author,
    },
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );
  // TODO
  console.log(postsPagination);
  // postsPagination.next_page = true;
  // postsPagination.results = Array(5).fill(postsPagination.results[0]);

  async function handleLoadMorePosts() {
    const response = await fetch(postsPagination.next_page);
    const responseData: ApiSearchResponse = await response.json();

    const postsLoaded = responseData.results.map(mapPostPreview);

    console.log(postsLoaded);

    setNextPage(responseData.next_page);
    setPosts([...posts, ...postsLoaded]);
  }

  return (
    <main className={styles.homeContainer}>
      <Header />
      <div className={`${commonStyles.container} ${commonStyles.bottomSpace}`}>
        {posts.map(post => (
          <div key={post.uid} className={styles.postItem}>
            <Link href={`/post/${post.uid}`}>
              <a>{post.data.title}</a>
            </Link>
            <p>{post.data.subtitle}</p>
            <time>
              <FiCalendar />
              <span>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: enUS,
                })}
              </span>
            </time>
            <span>
              <FiUser />
              <span>{post.data.author}</span>
            </span>
          </div>
        ))}

        {nextPage && (
          <a
            className={styles.loadPosts}
            href="/#"
            onClick={handleLoadMorePosts}
          >
            Carregar mais posts
          </a>
        )}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
    }
  );

  const posts: Post[] = postsResponse.results.map(mapPostPreview);

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  console.log(postsPagination);

  return {
    props: { postsPagination },
    revalidate: 60 * 10, // 10 min
  };
};
