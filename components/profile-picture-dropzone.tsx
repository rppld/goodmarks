import React from 'react'
import Image from './image'
import styles from './profile-picture-dropzone.module.css'
import getImageUrl from 'utils/get-image-url'
import { useDropzone } from 'react-dropzone'
import { useViewer } from 'components/viewer-context'
import useS3 from 'utils/use-s3'

interface Props {
  onDrop?: () => void
}

const ProfilePictureDropzone: React.FC<Props> = (props) => {
  const { viewer, setViewer } = useViewer()
  const [uploadFile, { loading }] = useS3()
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      props.onDrop()
      const fileName = await uploadFile(acceptedFiles[0])
      // Save new picture in database.
      handleUpdateUser(viewer.id, {
        picture: fileName,
      })
    },
  })

  const handleUpdateUser = (userId, payload) => {
    fetch('/api/users?action=update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates: payload }),
    })
      .then((res) => res.json())
      .then((data) => setViewer(data))
      .catch((err) => console.log(err))
  }

  return (
    <div {...getRootProps({ className: styles.container })}>
      {viewer?.picture && (
        <Image
          src={getImageUrl(viewer.picture, 'avatarLg')}
          className={styles.image}
        />
      )}
      <input {...getInputProps()} />
      <span className={styles.button}>{loading ? 'Loading' : 'Edit'}</span>
    </div>
  )
}

ProfilePictureDropzone.defaultProps = {
  onDrop: () => {},
}

export default ProfilePictureDropzone
