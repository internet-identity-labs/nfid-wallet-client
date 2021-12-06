const Screens = []

export const REGISTER_DEVICE_PROMPT = {
  title: "Register Device Prompt",
  path: "/rdp/:secret/:scope",
}

export const FLOWS = [
  {
    title: "First time authorize device flow",
    sequense: [REGISTER_DEVICE_PROMPT],
  },
]
