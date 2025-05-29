import { motion } from "framer-motion"
import { Button } from "packages/ui/src/molecules/button"
import CopyAddress from "packages/ui/src/molecules/copy-address"
import { FC } from "react"

export interface StakingDelegatesProps {
  followees: {
    name: string | undefined
    id: string
  }[]
  setIsModalOpen: (value: boolean) => void
}

export const StakingDelegates: FC<StakingDelegatesProps> = ({
  followees,
  setIsModalOpen,
}) => {
  return (
    <motion.div
      key="VotingPanel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="border border-gray-200 rounded-3xl px-[30px] py-[20px] relative">
        <div>
          {followees.map((followee, index) => (
            <div key={`${followee.id}_${index}`}>
              <div className="flex justify-between text-sm items-center h-[54px]">
                <p className="text-gray-400">{followee.name}</p>
                <div>
                  <CopyAddress
                    address={followee.id}
                    trailingChars={4}
                    leadingChars={6}
                  />
                </div>
              </div>
              {index < followees.length - 1 && (
                <div className="w-full h-[1px] bg-gray-200" />
              )}
            </div>
          ))}
          <Button
            block
            type="stroke"
            className="mt-[10px]"
            onClick={() => setIsModalOpen(true)}
          >
            Update delegate
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
