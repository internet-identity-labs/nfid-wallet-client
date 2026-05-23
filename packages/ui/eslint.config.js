import storybook from "eslint-plugin-storybook"

import rootConfig from "../../eslint.config.js"

export default [...rootConfig, ...storybook.configs["flat/recommended"]]
