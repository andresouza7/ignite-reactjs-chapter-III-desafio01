import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Link from 'next/link';
import { format } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
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
  // TODO
  console.log(postsPagination);
  postsPagination.next_page = true;
  postsPagination.results = Array(5).fill(postsPagination.results[0]);

  return (
    <main className={styles.homeContainer}>
      <Header />
      <div className={`${commonStyles.container} ${commonStyles.bottomSpace}`}>
        {postsPagination.results.map(post => (
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

        {postsPagination.next_page && (
          <a className={styles.loadPosts} href="/#">
            Load more posts
          </a>
        )}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // const prismic = getPrismicClient();
  // const postsResponse = await prismic.query(
  //   [Prismic.predicates.at('document.type', 'post')],
  //   {
  //     fetch: ['post.title', 'post.subtitle', 'post.author'],
  //     pageSize: 1,
  //   }
  // );

  // const posts: Post[] = postsResponse?.results.map(post => ({
  //   uid: post.uid,
  //   first_publication_date: post.first_publication_date,
  //   data: {
  //     title: post.data.title,
  //     subtitle: post.data.subtitle,
  //     author: post.data.author,
  //   },
  // }));

  function formatDate(date) {
    return format(new Date(), 'MMM dd yyyy', {
      locale: enUS,
    });
  }

  const postsPagination = {
    next_page:
      'https://ignite-blog-app.cdn.prismic.io/api/v2/documents/search?ref=YF3tixMAACAAPVi9&q=%5B%5Bat%28document.type%2C+%22post%22%29%5D%5D&page=2&pageSize=1',
    results: [
      {
        uid: 'spacex-rocket-debris-creates-a-fantastic-light-show',
        first_publication_date: formatDate('2021-03-26T14:19:55+0000'),
        data: {
          title:
            'SpaceX rocket debris creates a fantastic light show in the Pacific Northwest sky',
          subtitle: 'Not a meteor shower, but space age spoilage',
          author: 'James Vincent',
        },
      },
    ],
  };

  // const postsPagination: PostPagination = {
  //   next_page: postsResponse.next_page,
  //   results: posts,
  // };

  return {
    props: { postsPagination },
    revalidate: 60 * 10, // 10 min
  };
};
