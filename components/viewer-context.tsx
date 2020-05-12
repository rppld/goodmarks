import * as React from 'react'
import { User, ViewerData } from 'lib/types'
import useSWR from 'swr'

interface ContextProps {
  viewer: User
  resetViewer: () => void
}

// TODO: Read up on this kinda syntax
const ViewerContext = React.createContext<Partial<ContextProps>>({})

const ViewerProvider: React.FC = (props) => {
  const { data, mutate } = useSWR<ViewerData>('/api/me')
  const value = {
    viewer: data?.viewer,
    resetViewer: () => mutate({ viewer: null }),
  }

  return <ViewerContext.Provider value={value} {...props} />
}

function useViewer() {
  const context = React.useContext(ViewerContext)

  if (!context) {
    throw new Error('useViewer() must be used within a ViewerProvider')
  }

  const { viewer, resetViewer } = context

  return {
    viewer,
    resetViewer,
  }
}

export { ViewerProvider, useViewer }
