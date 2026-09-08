import { getJestProjectsAsync } from "@nx/jest"

export default async () => ({
  projects: [
    "<rootDir>/apps/nfid-frontend",
    "<rootDir>/apps/nfid-demo",
    ...(await getJestProjectsAsync()),
  ],
})
