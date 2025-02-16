

export default function BoardOverlay({ children }) {
    return (
        <div className="overflow-hidden h-dvh lg:p-3 p-2 bg-gradient-to-br from-teal-400 to-yellow-200 box-border">
          {children}
      </div>
    )
  }
  