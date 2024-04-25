//

import type { NextApiResponse, NextApiRequest } from "next";

const data = [
  {
    answer: "it is because",
    followupQuestions: [
      "How do sentiment analysis techniques contribute to irony detection?",
      "What are the challenges in accurately classifying emotions in ironic statements?",
      "How can sarcasm detection algorithms be improved for better irony detection?",
    ],
  },
];

export type QaResponse = {
  answer: string;
  followupQuestions: Array<string>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QaResponse[] | undefined>
) {
  console.log("1. does this go here?");
  // const { data } = req

  res.status(200).send(data);
}
