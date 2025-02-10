// app\admin\components\layout\Header\SearchBox.tsx
import { useEffect, useState } from 'react'
import { RiSearchLine } from 'react-icons/ri'
import SearchModal from './SearchModal'

const SearchBox: React.FC = () => {
  const [openSearchDialog, setOpenSearchDialog] = useState(false)

  // open search dialog when the user press Ctrl + / and state was true.
  // close when the user press Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === '/' && e.ctrlKey) {
        setOpenSearchDialog(true)
      }

      if (e.key === 'Escape') {
        setOpenSearchDialog(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = openSearchDialog ? 'hidden' : 'auto'
  }, [openSearchDialog])

  return (
    <>
      {openSearchDialog && (
        <SearchModal open={openSearchDialog} setOpen={setOpenSearchDialog} />
      )}
      <div className="flex-1 items-center justify-center lg:max-w-2xl">
        <div
          className="relative"
          onClick={() => {
            setOpenSearchDialog(true)
          }}
        >
          <RiSearchLine className="text-color-main/70 absolute top-[50%] left-2 -translate-y-[50%]" />
          <input
            type="text"
            placeholder="Buscar"
            className="border pl-8 rounded-xl text-color-main/70 w-full py-[5px] cursor-pointer"
            readOnly
            disabled
          />
          <span className="absolute text-sm flex gap-2 top-[50%] right-2 -translate-y-[50%]">
            <span className="bg-secondary-400/60 text-white px-2 rounded">
              Ctrl
            </span>
            <span className="bg-secondary-400/60 text-white px-2 rounded">
              /
            </span>
          </span>
        </div>
      </div>
    </>
  )
}

export default SearchBox
