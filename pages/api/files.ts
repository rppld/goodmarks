import { NextApiRequest, NextApiResponse } from 'next'
import { post } from 'lib/s3'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { name, contentType } = req.body
    const data = await post(name, contentType)
    res.status(200).json(data)
  } catch (error) {
    res.status(400).send(error.message)
  }
}
