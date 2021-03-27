import { GetStaticPaths, GetStaticProps } from 'next';

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import enUS from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

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
      body: {
        text: string;
      }[];
    }[];
  };
}

function mapPostContent(responseResults): Post {
  return {
    first_publication_date: responseResults.first_publication_date,
    data: {
      title: responseResults.data.title,
      banner: {
        url: responseResults.data.banner.url,
      },
      author: responseResults.data.author,
      content: responseResults.data.content.map(section => {
        return {
          heading: section.heading,
          body: section.body.map(({ text }) => ({ text })),
        };
      }),
    },
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO
  const { isFallback } = useRouter();

  if (isFallback) {
    return <div>Carregando...</div>;
  }

  // get reading time
  const wordCount = post.data?.content.reduce((acc, item) => {
    const sectionWordCount = RichText.asText(item.body).split(' ').length;
    return acc + sectionWordCount;
  }, 0);
  const readingTime = Math.ceil(wordCount / 200);

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
            <span>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: enUS,
              })}
            </span>
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
            {content.body.map(item => (
              <p key={Math.random().toString()}>{item.text}</p>
            ))}
            {/* <div dangerouslySetInnerHTML={{ __html: String(content.body) }} /> */}
          </div>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.banner', 'post.author', 'post.content'],
    }
  );

  const paths = response?.results.map(result => {
    return {
      params: {
        slug: result.uid,
      },
    };
  });

  // console.log(paths);

  // TODO
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    fetch: ['post.title', 'post.banner', 'post.author', 'post.content'],
  });

  console.log(response.data);

  const post: Post = mapPostContent(response);

  // TODO
  return {
    props: { post },
    revalidate: 60 * 30, // 30 min
  };
};
