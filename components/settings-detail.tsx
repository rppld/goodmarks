import React from 'react'
import { VStack, HStack } from './stack'
import ProfilePictureDropzone from './profile-picture-dropzone'
import Input from './input'
import Button from './button'
import Form from './form'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { useViewer } from './viewer-context'

const SettingsDetail: React.FC = () => {
  const { viewer, setViewer } = useViewer()

  const handleUpdateUser = (values) => {
    formik.setSubmitting(true)

    fetch('/api/users?action=update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: viewer.id,
        payload: {
          ...viewer,
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
      .max(40, 'Must be 50 characters or less'),
    bio: Yup.string()
      .min(5, 'Must be 5 characters or more')
      .max(70, 'Must be 70 characters or less'),
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
    <VStack>
      <ProfilePictureDropzone />

      <Form onSubmit={formik.handleSubmit}>
        <Input
          labelText="Name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <Input
          as="textarea"
          rows="6"
          labelText="Bio"
          name="bio"
          value={formik.values.bio}
          onChange={formik.handleChange}
        />
        <HStack alignment="trailing">
          <Button
            type="submit"
            variant="primary"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Saving' : 'Save profile'}
          </Button>
        </HStack>
      </Form>
    </VStack>
  )
}

export default SettingsDetail
