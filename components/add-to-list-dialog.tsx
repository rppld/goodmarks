import React from 'react'
import useSWR, { mutate } from 'swr'
import { useViewer } from './viewer-context'
import Dialog, { DialogProps } from './dialog'
import Button from './button'
import useAddBookmarkToList from 'utils/use-add-bookmark-to-list'
import { Listbox, ListboxOption } from '@reach/listbox'

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

  return (
    <Dialog {...props} a11yTitle="Add bookmark to list">
      {data?.edges.length > 0 && (
        <Listbox value={value} onChange={setValue}>
          {data?.edges.map((item) => (
            <ListboxOption key={item.list.id} value={item.list.id}>
              {item.list.name}
            </ListboxOption>
          ))}
        </Listbox>
      )}

      <Button onClick={handleAddToList} disabled={loading}>
        {loading ? 'Adding' : 'Add to list'}
      </Button>
    </Dialog>
  )
}

AddToListDialog.defaultProps = {
  onSuccess: () => {},
}

export default AddToListDialog
