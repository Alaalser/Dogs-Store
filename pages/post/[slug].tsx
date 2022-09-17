import { GetStaticProps } from 'next';
import PortableText from 'react-portable-text';
import Header from '../../components/Header';
import { urlFor, sanityClient } from '../../sanity';
import { Post } from '../../types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';

interface Props {
  post: Post;
}

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

const Post = ({ post }: Props) => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then(() => {
        setSubmitted(true);
        console.log(data);
      })
      .catch((err) => {
        setSubmitted(false);
        console.log(err);
      });
  };

  return (
    <main>
      <Header />

      <img
        className="w-full h-40 object-cover"
        src={urlFor(post.mainImage).url()}
        alt="golden retriever"
      />

      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-5 ">
          {post.description}
        </h2>

        <div className="flex items-center space-x-2">
          <img
            className="h-10 w-10 rounded-full"
            src={urlFor(post.author.image).url()}
            alt="author"
          />
          <p className=" font-extralight text-sm">
            Posted by
            <span className=" text-green-600"> {post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-10">
          <PortableText
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="my-5 text-xl font-bold" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>

      <hr className="my-5 border max-w-lg mx-auto border-yellow-500" />

      {submitted ? (
        <div className="flex flex-col max-w-3xl mx-auto bg-yellow-500 p-10 m-10 space-y-3 items-center text-white ">
          <h4 className=" text-3xl">Thanks for you comment</h4>
          <p>Once it has been approved, it will appear</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mb-10 flex max-w-2xl flex-col p-5"
          >
          <h3 className="text-sm text-yellow-500">Enjoyed this article?e</h3>
          <h4 className="text-3xl font-bold py-5">Leave a comment below!</h4>
          <hr className="py-3 mt-2" />

          <input
            type="hidden"
            {...register('_id')}
            name="_id"
            value={post._id}
          />

          <label className="text-sm text-gray-500">
            <span className="block pt-3 pb-2">Name</span>
            <input
              {...register('name', { required: true })}
              className="w-full border border-yellow-500 shadow-lg rounded  p-2 form-input  outline-none focus:ring-5"
              type="text"
            />
          </label>
          <label className="text-sm text-gray-500">
            <span className="block pt-3 pb-2">Email</span>
            <input
              {...register('email', { required: true, pattern: /^\S+@\S+$/ })}
              className="w-full border border-yellow-500 shadow-lg rounded  p-2 form-input outline-none focus:ring-5"
              type="text"
            />
          </label>
          <label className="text-sm text-gray-500">
            <span className="block pt-3 pb-2">Comment</span>
            <textarea
              {...register('comment', { required: true })}
              className="w-full border border-yellow-500 shadow-lg rounded  p-2 form-textarea outline-none focus:ring-5"
              rows={8}
            />
          </label>

          {errors.name && <p className="text-red-500">The name is required</p>}
          {errors.email && (
            <p className="text-red-500">The email is required</p>
          )}
          {errors.comment && (
            <p className="text-red-500">The comment is required</p>
          )}

          <input
            type="submit"
            className=" px-3 py-2 mt-3 rounded text-white bg-yellow-500 "
            value="Submit"
          />
        </form>
      )}
      <div className=" p-10 mb-5 max-w-2xl mx-auto shadow shadow-yellow-500 border items-center">
        <h3 className="text-4xl">Comments</h3>
        <hr className="mb-3" />
        {post.comments.map((comment) => (
          <div className="text-2xl " key={comment._id}>
            <p>
              <span className="text-yellow-500"> {comment.name}:</span>{' '}
              {comment.comment}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type=='post']{
        _id,
        slug {
            current
        },
    }`;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type=='post' && slug.current==$slug][0]{
        _id,
        _createdAt,
        title,
        author->{
            name,
            image
        },
        'comments':*[_type=='comment' && 
         post._ref==^._id &&
         approved ==true],
        description,
        mainImage,
        slug,
        body
    }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};
