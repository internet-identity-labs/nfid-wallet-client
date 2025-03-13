import { Meta, StoryFn } from "@storybook/react"
import clsx from "clsx"
import React from "react"

import { ReactComponent as ArrowGreen } from "./arrow-green.svg"
import { ReactComponent as ArrowRed } from "./arrow-red.svg"
import { ReactComponent as Arrow } from "./arrow.svg"
import { ReactComponent as Calendar } from "./calendar.svg"
import { ReactComponent as Cancel } from "./cancel.svg"
import { ReactComponent as Chevron } from "./chevron.svg"
import { ReactComponent as Copy } from "./copy.svg"
import { ReactComponent as Desktop } from "./desktop.svg"
import { ReactComponent as Dokument } from "./document.svg"
import { ReactComponent as Dots } from "./dots.svg"
import { ReactComponent as Error } from "./error.svg"
import { ReactComponent as FilledArrowRight } from "./filled-arrow-right.svg"
import { ReactComponent as Gmail } from "./gmail.svg"
import { ReactComponent as Google } from "./google.svg"
import { ReactComponent as Info } from "./info.svg"
import { ReactComponent as Key } from "./key.svg"
import { ReactComponent as Laptop } from "./laptop.svg"
import { ReactComponent as Logout } from "./logout.svg"
import { ReactComponent as MapPin } from "./map-pin.svg"
import { ReactComponent as Members } from "./members.svg"
import { ReactComponent as Mobile } from "./mobile.svg"
import { ReactComponent as Pencil } from "./pencil.svg"
import { ReactComponent as Plus } from "./plus.svg"
import { ReactComponent as Policies } from "./policies.svg"
import { ReactComponent as Recovery } from "./recovery.svg"
import { ReactComponent as Refresh } from "./refresh.svg"
import { ReactComponent as Success } from "./success.svg"
import { ReactComponent as Tablet } from "./tablet.svg"
import { ReactComponent as TouchId } from "./touch-id.svg"
import { ReactComponent as Transactions } from "./transactions.svg"
import { ReactComponent as Trash } from "./trash.svg"
import { ReactComponent as Unknown } from "./unknown.svg"
import { ReactComponent as Usb } from "./usb.svg"
import { ReactComponent as Wallet } from "./wallet.svg"

const meta: Meta = {
  title: "Atoms/Icons",
  argTypes: {
    onClick: {
      action: "clicked",
    },
    className: {
      options: [
        "text-primary-600",
        "text-secondary",
        "text-red-600",
        "text-orange-600",
        "text-amber-600",
        "text-green-600",
        "text-emerald-600",
        "text-teal-600",
        "text-cyan-600",
        "text-indigo-600",
        "text-violet-600",
        "text-purple-600",
      ],
      control: { type: "radio" },
    },
  },
}

export default meta

const IconWrapper: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <div className="flex flex-col items-center p-4 space-y-2 border rounded center">
    <div>{icon}</div>
    <div className="text-xs">{label}</div>
  </div>
)

const Icons: StoryFn = (args) => {
  return (
    <div>
      <div className="mb-2 font-bold">Controls:</div>
      <div className="flex items-center gap-2">
        <IconWrapper
          icon={<Arrow className={clsx(args["className"])} />}
          label="Arrow"
        />
        <IconWrapper
          icon={<Arrow className={clsx(args["className"], "rotate-90")} />}
          label="Arrow Up"
        />
        <IconWrapper
          icon={<Arrow className={clsx(args["className"], "rotate-180")} />}
          label="Arrow Right"
        />
        <IconWrapper
          icon={<Arrow className={clsx(args["className"], "-rotate-90")} />}
          label="Arrow Down"
        />
        <IconWrapper
          icon={<ArrowRed className={clsx(args["className"])} />}
          label="Arrow Red"
        />
        <IconWrapper
          icon={<ArrowGreen className={clsx(args["className"])} />}
          label="Arrow Red"
        />
        <IconWrapper
          icon={<Calendar className={clsx(args["className"])} />}
          label="Calendar"
        />
        <IconWrapper
          icon={<Cancel className={clsx(args["className"])} />}
          label="Cancel"
        />
        <IconWrapper
          icon={<Chevron className={clsx(args["className"])} />}
          label="Chevron"
        />
        <IconWrapper
          icon={<Copy className={clsx(args["className"])} />}
          label="Copy"
        />
        <IconWrapper
          icon={<Dots className={clsx(args["className"])} />}
          label="Dots"
        />
        <IconWrapper
          icon={<Error className={clsx(args["className"])} />}
          label="Error"
        />
        <IconWrapper
          icon={<Info className={clsx(args["className"])} />}
          label="Info"
        />
        <IconWrapper
          icon={<Logout className={clsx(args["className"])} />}
          label="Logout"
        />
        <IconWrapper
          icon={<Pencil className={clsx(args["className"])} />}
          label="Pencil"
        />
        <IconWrapper
          icon={<Plus className={clsx(args["className"])} />}
          label="Plus"
        />
        <IconWrapper
          icon={<Refresh className={clsx(args["className"])} />}
          label="Refresh"
        />
        <IconWrapper
          icon={<Success className={clsx(args["className"])} />}
          label="Success"
        />
        <IconWrapper
          icon={<TouchId className={clsx(args["className"])} />}
          label="TouchId"
        />
        <IconWrapper
          icon={<Trash className={clsx(args["className"])} />}
          label="Trash"
        />
        <IconWrapper
          icon={<FilledArrowRight className={clsx(args["className"])} />}
          label="FilledArrowRight"
        />
      </div>
      <div className="mb-2 font-bold">Devices:</div>
      <div className="flex items-center gap-2">
        <IconWrapper
          icon={<Desktop className={clsx(args["className"])} />}
          label="Desktop"
        />
        <IconWrapper
          icon={<Dokument className={clsx(args["className"])} />}
          label="Dokument"
        />
        <IconWrapper
          icon={<Key className={clsx(args["className"])} />}
          label="Key"
        />
        <IconWrapper
          icon={<Laptop className={clsx(args["className"])} />}
          label="Laptop"
        />
        <IconWrapper
          icon={<Mobile className={clsx(args["className"])} />}
          label="Mobile"
        />
        <IconWrapper
          icon={<Recovery className={clsx(args["className"])} />}
          label="Recovery"
        />
        <IconWrapper
          icon={<Tablet className={clsx(args["className"])} />}
          label="Tablet"
        />
        <IconWrapper
          icon={<Usb className={clsx(args["className"])} />}
          label="Usb"
        />
        <IconWrapper
          icon={<Unknown className={clsx(args["className"])} />}
          label="Unknown"
        />
      </div>
      <div className="mb-2 font-bold">Other:</div>
      <div className="flex items-center gap-2">
        <IconWrapper
          icon={<Gmail className={clsx(args["className"])} />}
          label="Gmail"
        />
        <IconWrapper icon={<Google />} label="Google" />
        <IconWrapper
          icon={<MapPin className={clsx(args["className"])} />}
          label="MapPin"
        />
      </div>
      <div className="mb-2 font-bold">Other:</div>
      <div className="flex items-center gap-2">
        <IconWrapper
          icon={<Transactions className={clsx("h-6", args["className"])} />}
          label="Transactions"
        />
        <IconWrapper
          icon={<Policies className={clsx("h-6", args["className"])} />}
          label="Policies"
        />
        <IconWrapper
          icon={<Members className={clsx("h-6", args["className"])} />}
          label="Members"
        />
        <IconWrapper
          icon={<Wallet className={clsx("h-6", args["className"])} />}
          label="Wallet"
        />
      </div>
    </div>
  )
}

export const Overview = {
  render: Icons,

  args: {
    className: "text-blue",
  },
}
