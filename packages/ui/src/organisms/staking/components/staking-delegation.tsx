import { motion } from "framer-motion"
import CopyAddress from "packages/ui/src/molecules/copy-address"
import { FC } from "react"

export interface StakingDelegationProps {
  followees: {
    name: string | undefined
    id: string
  }[]
}

export const StakingDelegation: FC<StakingDelegationProps> = ({
  followees,
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
            <div key={followee.id}>
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
        </div>
      </div>
    </motion.div>
  )
}
