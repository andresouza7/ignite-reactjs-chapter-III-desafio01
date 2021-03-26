import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { useState } from 'react';
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

function mapPostPreview(post: ApiSearchResponse): Post {
  return {
    uid: post.uid,
    first_publication_date: prettifyDate(post.first_publication_date),
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
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
  const [posts, setPosts] = useState<Posts[]>(postsPagination.results);
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
              <span>{post.first_publication_date}</span>
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
  const postsResponse = await getPaginatedPosts(1);

  const posts: Post[] = postsResponse?.results.map(mapPostPreview);

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  // const postsPagination = {
  //   next_page:
  //     'https://ignite-blog-app.cdn.prismic.io/api/v2/documents/search?ref=YF3tixMAACAAPVi9&q=%5B%5Bat%28document.type%2C+%22post%22%29%5D%5D&page=2&pageSize=1',
  //   results: [
  //     {
  //       uid: 'spacex-rocket-debris-creates-a-fantastic-light-show',
  //       first_publication_date: prettifyDate('2021-03-26T14:19:55+0000'),
  //       data: {
  //         title:
  //           'SpaceX rocket debris creates a fantastic light show in the Pacific Northwest sky',
  //         subtitle: 'Not a meteor shower, but space age spoilage',
  //         author: 'James Vincent',
  //       },
  //     },
  //   ],
  // };

  return {
    props: { postsPagination },
    revalidate: 60 * 10, // 10 min
  };
};
