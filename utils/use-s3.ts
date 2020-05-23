import React from 'react'

const useS3 = (): [
  (file: any) => Promise<string>,
  {
    loading: boolean
    error: string | null
  }
] => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  async function handler(file) {
    try {
      setLoading(true)
      setError(null)

      // Get presigned post-data
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: file.type,
          name: file.name.split('.')[0],
        }),
      })
      const { fields, url, acl, ...presignedPost } = await res.json()
      const formData = new FormData()
      // The order of these matters – don’t change it.
      formData.append('key', fields.key)
      formData.append('acl', acl)
      formData.append('Content-Type', presignedPost['Content-Type'])
      formData.append('X-Amz-Credential', fields['X-Amz-Credential'])
      formData.append('X-Amz-Algorithm', fields['X-Amz-Algorithm'])
      formData.append('X-Amz-Date', fields['X-Amz-Date'])
      formData.append('Policy', fields['Policy'])
      formData.append('X-Amz-Signature', fields['X-Amz-Signature'])
      formData.append('file', file, file.name)

      // Upload image to S3
      await fetch(url, {
        method: 'POST',
        body: formData,
      })

      setLoading(false)
      return fields.key
    } catch (error) {
      console.log(error)
      setError(error.message)
      setLoading(false)
    }
  }

  return [handler, { loading, error }]
}

export default useS3
