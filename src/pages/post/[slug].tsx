import { GetStaticPaths, GetStaticProps } from 'next';

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { prettifyDate } from '../../util/prettifyDate';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      // bodyTest?: {
      //   text: string;
      // };
      body: {
        text: string;
      }[];
    }[];
  };
}

function mapPostContent(responseResults): Post {
  return {
    first_publication_date: prettifyDate(
      responseResults.first_publication_date
    ),
    data: {
      title: responseResults.data.title,
      banner: {
        url: responseResults.data.banner.url,
      },
      author: responseResults.data.author,
      content: responseResults.data.content.map(section => {
        return {
          heading: section.heading,
          body: RichText.asHtml(section.body),
          // bodyTest: section.body.map(({ text }) => text),
        };
      }),
    },
  };
}

interface PostProps {
  post: Post;
  readingTime: number;
}

export default function Post({ post, readingTime }: PostProps) {
  // TODO
  console.log(readingTime);
  console.log(post);

  const { isFallback } = useRouter();

  if (isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />

      <div
        className={styles.banner}
        style={{ backgroundImage: `url(${post?.data.banner.url})` }}
      />

      <div className={`${commonStyles.container} ${styles.postHeading}`}>
        <h1>{post?.data.title}</h1>
        <div className={styles.postHeadingInfo}>
          <div>
            <FiCalendar />
            <span>{post?.first_publication_date}</span>
          </div>
          <div>
            <FiUser />
            <span>{post?.data.author}</span>
          </div>
          <div>
            <FiClock />
            <span>{`${readingTime} min`}</span>
          </div>
        </div>
      </div>

      <main className={`${commonStyles.container} ${commonStyles.bottomSpace}`}>
        {post?.data.content.map(content => (
          <div key={Math.random().toString()} className={styles.postBody}>
            <h2>{content.heading}</h2>
            <div dangerouslySetInnerHTML={{ __html: String(content.body) }} />
          </div>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  // TODO
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', slug, {});

  // get reading time
  const wordCount = response.data?.content.reduce((acc, item) => {
    const sectionWordCount = RichText.asText(item.body).split(' ').length;
    return acc + sectionWordCount;
  }, 0);
  const readingTime = Math.ceil(wordCount / 200);

  const post = mapPostContent(response);

  console.log(post);

  // TODO
  return {
    props: { post, readingTime },
    revalidate: 60 * 30, // 30 min
  };
};
