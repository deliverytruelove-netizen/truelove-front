interface Props {
    children: React.ReactNode
    title: string
  }
  
  const Section: React.FC<Props> = ({ title, children }) => {
    return (
      <section>
        <div className="bg-white shadow-sm rounded-md divide-y mb-16">
          {/* Head */}
          <div className="px-2 lg:px-5 py-4">
            <h3 className="text-color-main font-medium text-md">{title}</h3>
          </div>
          {/* children */}
          {children}
        </div>
      </section>
    )
  }
  
  export default Section
  