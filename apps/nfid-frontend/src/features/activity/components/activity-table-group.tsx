import { IActivityRowGroup } from "../types"
import { ActivityTableRow } from "./activity-table-row"

interface IActivityTableGroup extends IActivityRowGroup {
  groupIndex: number
}

export const ActivityTableGroup = ({
  date,
  rows,
  groupIndex,
}: IActivityTableGroup) => {
  return (
    <>
      <tr>
        <td className="pt-5 text-sm font-bold text-gray-400">{date}</td>
      </tr>
      {rows.map((row, i) => (
        <ActivityTableRow
          {...row}
          id={`group_${groupIndex}_activity_${i}`}
          key={`group_${groupIndex}_activity_${i}`}
        />
      ))}
    </>
  )
}
