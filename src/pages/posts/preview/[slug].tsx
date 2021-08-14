import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/client";
import { useRouter } from "next/dist/client/router";
import Head from "next/head";
import Link from "next/link";
import { RichText } from "prismic-dom";
import React from "react";
import { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";

import Style from "../post.module.scss";

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function PostPreview({ post }: PostPreviewProps) {
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);


  return (
    <>
      <Head>
        <title>{post.title} | ignews</title>
      </Head>

      <main className={Style.container}>
        <article className={Style.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${Style.postContent} ${Style.postPreviewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className={Style.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a href="">Subscribe Now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID("publication", String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-br",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };

  return {
    props: { post },
  };
};
