// write the take notes function

import type { NextApiRequest, NextApiResponse } from "next";

export type ArxivPaperNote = {
  note: string;
  pageNumbers: Array<number>;
};

const hardcodedNote: ArxivPaperNote[] = [
  {
    note: "Strategic reasoning involves understanding and predicting adversary actions in multi-agent settings while adjusting strategies accordingly.",
    pageNumbers: [1],
  },
  {
    note: "Strategic reasoning challenges are highly relevant to real-world issues, including business analysis and policy making.",
    pageNumbers: [1],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Array<ArxivPaperNote>>
) {
  // 1. define the API URL, preferably from environment variable
  const API_URL = "localhost:8000/take_notes";
  // 2. fetch from the api with post request, pass in headers, and body

  // const response = await fetch(API_URL, {
  //   method: "post",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: req.body,
  // }).then((res) => {
  //   if (res.ok) {
  //     return res;
  //   }
  // });
  // 3. return jjson
  // 4 if there's data send back the data with res.status(200).send(data)
  // 5. otherwise return res(400)
  //
  res.status(200).send(hardcodedNote);
}
