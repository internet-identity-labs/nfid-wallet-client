declare module "*.png" {
  const content: any
  export default content
}
declare module "*.gif" {
  const content: any
  export default content
}
declare module "*.lottie" {
  const content: any
  export default content
}
declare module "*.svg" {
  import * as React from 'react';
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export { ReactComponent };
}
