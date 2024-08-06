import { getJestProjects } from "@nx/jest"

export default {
  projects: [
    "<rootDir>/apps/nfid-frontend",
    "<rootDir>/apps/nfid-demo",
    ...getJestProjects(),
  ],
}
