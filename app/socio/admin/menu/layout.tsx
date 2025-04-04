// app\socio\admin\menu\layout.tsx
export default function MenuLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="bg-white">
        {children}
      </div>
    )
  }
  
  