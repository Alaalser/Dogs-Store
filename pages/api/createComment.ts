import type { NextApiRequest, NextApiResponse } from 'next';
import sanityClient from '@sanity/client';

export const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
};

const client = sanityClient(config);

const createComment = async (req: NextApiRequest, res: NextApiResponse) => {
  const { _id, comment, name, email } = JSON.parse(req.body);

  try {
    await client.create({
      _type: 'comment',
      post: {
        _ref: _id,
        _type: 'reference',
      },
      name,
      email,
      comment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'submit failed', error });
  }
  return res.status(200).json({ message: 'submit success' });
};

export default createComment;
