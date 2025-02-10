// app\admin\components\layout\Header\SearchModal.tsx
import { motion } from 'framer-motion'
import { RiSearchLine } from 'react-icons/ri'

interface Props {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SearchModal: React.FC<Props> = ({ open, setOpen }) => {
  return (
    <div className="fixed w-full h-full left-0 top-0 bg-black/30 backdrop-blur-[1px] z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        variants={{
          open: { opacity: 1, scale: 1 },
          close: { opacity: 0, scale: 0.5 }
        }}
        animate={open ? 'open' : 'close'}
        className="absolute  py-2 bg-white top:0 h-full w-full sm:rounded-md sm:top-10 sm:h-80 sm:w-11/12 md:w-2/3 px-4 right-0 left-0 m-auto shadow-xl"
      >
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <RiSearchLine className="text-color-main/70 absolute top-[50%] left-3 -translate-y-[50%]" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-9 border rounded-2xl bg-[#f7f7f7] outline-none text-color-main/70 w-full py-2 cursor-pointer"
            />
          </div>
          <div>
            <button
              className="bg-transparent hover:text-primary-400 text-primary-400/90 transition-colors"
              onClick={() => {
                setOpen(false)
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
        <div>
          <div className="text-color-main/70 text-sm mt-20 text-center">
            No hay busquedas recientes
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SearchModal
