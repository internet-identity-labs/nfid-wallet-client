import { parameters as rootParameters } from "../../../.storybook/preview"
import "./styles.scss"

export const parameters = {
  ...rootParameters,
}

// there is an issue with the storybook webpack config that causes the following error:
// Ignored an update to unaccepted module
// https://github.com/nrwl/nx/issues/11209
if (module.hot) {
  module.hot.accept()
}
