import { getJestProjects } from "@nrwl/jest"

export default {
  projects: [
    "<rootDir>/apps/nfid-frontend",
    "<rootDir>/apps/nfid-demo",
    ...getJestProjects(),
  ],
}
