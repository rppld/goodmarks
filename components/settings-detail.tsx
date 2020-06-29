import React from 'react'
import { HStack } from './stack'
import ProfilePictureDropzone from './profile-picture-dropzone'
import Input from './input'
import Button from './button'
import Form from './form'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { useViewer } from './viewer-context'

const SettingsDetail: React.FC = () => {
  const bioMaxLength = 70
  const { viewer, setViewer } = useViewer()

  const handleUpdateUser = (values) => {
    const { id: userId, ...viewerData } = viewer
    formik.setSubmitting(true)

    fetch('/api/users?action=update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        payload: {
          ...viewerData,
          ...values,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setViewer(data)
        formik.setSubmitting(false)
      })
      .catch((err) => console.log(err))
  }

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(5, 'Must be 5 characters or more')
      .max(40, 'Must be 40 characters or less'),
    bio: Yup.string()
      .min(5, 'Must be 5 characters or more')
      .max(bioMaxLength, `Must be ${bioMaxLength} characters or less`),
  })

  const formik = useFormik({
    initialValues: {
      name: '',
      bio: '',
    },
    validationSchema,
    onSubmit: handleUpdateUser,
  })

  React.useEffect(() => {
    formik.setFieldValue('name', viewer?.name)
    formik.setFieldValue('bio', viewer?.bio)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer])

  return (
    <>
      <ProfilePictureDropzone />

      <Form onSubmit={formik.handleSubmit}>
        <Input
          labelText="Name"
          name="name"
          defaultValue={formik.values.name}
          onChange={formik.handleChange}
        />

        <Input
          as="textarea"
          rows="6"
          labelText="Bio"
          name="bio"
          help={
            formik.values.bio
              ? String(bioMaxLength - formik.values.bio.length)
              : String(bioMaxLength)
          }
          defaultValue={formik.values.bio}
          onChange={formik.handleChange}
        />

        <footer>
          <HStack alignment="trailing">
            <Button
              type="submit"
              variant="primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Saving' : 'Save profile'}
            </Button>
          </HStack>
        </footer>
      </Form>
    </>
  )
}

export default SettingsDetail
