import Prismic from '@prismicio/client';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import { DefaultClient } from '@prismicio/client/types/client';

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
    req,
  });

  return prismic;
}

export function getPaginatedPosts(pages = 10) {
  const prismic = getPrismicClient();
  return prismic.query([Prismic.predicates.at('document.type', 'post')], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: pages,
  });
}
