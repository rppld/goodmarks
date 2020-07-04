import React from 'react'
import useSWR, { mutate } from 'swr'
import { useViewer } from './viewer-context'
import Dialog, { DialogProps } from './dialog'
import Button from './button'
import useAddBookmarkToList from 'utils/use-add-bookmark-to-list'
import { Listbox, ListboxOption } from '@reach/listbox'
import { VStack } from './stack'
import { H3 } from './heading'
import { ArrowDown } from './icon'
import { Text } from './text'
import Link from 'next/link'

interface Props extends DialogProps {
  bookmarkId: string
  onSuccess?: () => any
}

const AddToListDialog: React.FC<Props> = ({
  bookmarkId,
  onSuccess,
  ...props
}) => {
  const [value, setValue] = React.useState(null)
  const [addToList, { loading }] = useAddBookmarkToList()
  const { viewer } = useViewer()
  const { data } = useSWR(
    props.isOpen && viewer.handle ? `/api/lists?handle=${viewer.handle}` : null,
    { onSuccess: (data) => setValue(data?.edges[0].list.id) }
  )

  const handleAddToList = async () => {
    const res = await addToList(bookmarkId, value)
    mutate(`/api/lists?id=${value}`)
    onSuccess()
    console.log(res)
  }

  console.log(data)

  return (
    <Dialog {...props} a11yTitle="Add bookmark to list">
      <VStack spacing="md">
        <VStack spacing="sm">
          <H3 as="h1">Add to list</H3>
          <Text meta as="p">
            Add to one of your exisisting lists or{' '}
            <Link href="/lists/new">
              <a>create a new list.</a>
            </Link>
          </Text>
        </VStack>

        {data?.edges.length > 0 && (
          <Listbox value={value} onChange={setValue} arrow={<ArrowDown />}>
            {data?.edges.map((item) => (
              <ListboxOption key={item.list.id} value={item.list.id}>
                {item.list.name}
              </ListboxOption>
            ))}
          </Listbox>
        )}

        <Button
          onClick={handleAddToList}
          disabled={loading}
          variant="primary"
          size="lg"
          fullWidth
        >
          {loading ? 'Adding' : 'Add to list'}
        </Button>
      </VStack>
    </Dialog>
  )
}

AddToListDialog.defaultProps = {
  onSuccess: () => {},
}

export default AddToListDialog
