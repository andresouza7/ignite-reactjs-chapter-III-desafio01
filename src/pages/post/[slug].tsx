import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

import { RichText } from 'prismic-dom';
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

interface PostProps {
  post: Post;
  readingTime: number;
}

export default function Post({ post, readingTime }: PostProps) {
  // TODO
  console.log(readingTime);
  console.log(post);

  return (
    <>
      <Header />

      <div
        className={styles.banner}
        style={{ backgroundImage: `url(${post?.data.banner})` }}
      />

      <div className={`${commonStyles.container} ${styles.postHeading}`}>
        <h1>{post?.data.title}</h1>
        <span>{post?.first_publication_date}</span>
        <span>{post?.data.author}</span>
        <span>{readingTime}</span>
      </div>

      <main className={`${commonStyles.container} ${commonStyles.bottomSpace}`}>
        {post?.data.content.map(content => (
          <div key={Math.random().toString()}>
            <h2>{content.heading}</h2>
            <div
              className={styles.postBody}
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
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
  const response = await prismic.getByUID('post', slug);

  // format date
  const datePretty = format(
    new Date(response.first_publication_date),
    'MMM dd yyyy',
    {
      locale: enUS,
    }
  );

  // get reading time
  const wordCount = response.data?.content.reduce((acc, item) => {
    const sectionWordCount = RichText.asText(item.body).split(' ').length;
    return acc + sectionWordCount;
  }, 0);
  const readingTime = Math.ceil(wordCount / 200);

  const post: Post = {
    first_publication_date: datePretty,
    data: {
      title: response.data.title,
      banner: response.data.banner.url,
      author: response.data.author,
      content: response.data.content.map(section => {
        return {
          heading: section.heading,
          body: RichText.asHtml(section.body),
        };
      }),
    },
  };

  console.log(post);

  // TODO
  return {
    props: { post, readingTime },
    revalidate: 60 * 30, // 30 min
  };
};
