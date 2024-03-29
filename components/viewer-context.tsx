import * as React from 'react'
import { Viewer, ViewerData } from 'lib/types'
import useSWR from 'swr'

interface ContextProps {
  viewer: Viewer
  setViewer: (viewer: Viewer) => void
  resetViewer: () => void
}

// @todo: Read up on this kinda syntax
const ViewerContext = React.createContext<Partial<ContextProps>>({})

const ViewerProvider: React.FC = (props) => {
  const { data, mutate } = useSWR<ViewerData>('/api/me')
  const value = {
    viewer: data?.viewer,
    setViewer: (viewer) => mutate({ viewer }),
    resetViewer: () => mutate({ viewer: null }),
  }

  return <ViewerContext.Provider value={value} {...props} />
}

function useViewer() {
  const context = React.useContext(ViewerContext)

  if (!context) {
    throw new Error('useViewer() must be used within a ViewerProvider')
  }

  const { viewer, setViewer, resetViewer } = context

  return {
    viewer,
    setViewer,
    resetViewer,
  }
}

export { ViewerProvider, useViewer }
