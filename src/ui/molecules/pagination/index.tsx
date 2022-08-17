import clsx from "clsx"
import React from "react"

import Arrow from "./assets/arrow.svg"
import ArrowDisabled from "./assets/arrowDisabled.svg"

import Box from "./pagination-box"

interface IPagination extends React.HTMLAttributes<HTMLDivElement> {
  data: any[]
  perPage?: number
  sliceData: (data: any[]) => void
}

const Pagination: React.FC<IPagination> = ({
  data,
  perPage = 10,
  sliceData,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1)

  const pagesQuantity = React.useMemo(() => {
    return Math.round(data.length / perPage)
  }, [data, perPage])

  React.useEffect(() => {
    const result = data.slice(
      (currentPage - 1) * 10,
      (currentPage - 1) * 10 + 10,
    )
    if (!result.length) {
      setCurrentPage(1)
      sliceData([])
    } else sliceData(result)
  }, [currentPage, data, sliceData])

  return (
    <div className={clsx("flex items-center", !data.length && "hidden")}>
      <Box
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
        className={clsx(currentPage !== 1 && "rotate-180")}
      >
        <img src={currentPage === 1 ? ArrowDisabled : Arrow} alt="arrow next" />
      </Box>
      {Array(pagesQuantity)
        .fill(null)
        .map((_, index) => (
          <Box
            onClick={() => setCurrentPage(index + 1)}
            isActive={index === currentPage - 1}
          >
            {index + 1}
          </Box>
        ))}
      <Box
        disabled={currentPage === pagesQuantity}
        onClick={() => setCurrentPage(currentPage + 1)}
        className={clsx(currentPage === pagesQuantity && "rotate-180")}
      >
        <img
          src={currentPage === pagesQuantity ? ArrowDisabled : Arrow}
          alt="arrow previous"
        />
      </Box>
    </div>
  )
}

export default Pagination
