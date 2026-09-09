// React 19 removed the global JSX namespace from @types/react; re-expose it here
// so existing JSX.Element / JSX.IntrinsicElements references keep working.
declare namespace JSX {
  type Element = React.JSX.Element
  type ElementClass = React.JSX.ElementClass
  type IntrinsicElements = React.JSX.IntrinsicElements
  type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>
  interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
  interface IntrinsicClassAttributes<T> extends React.JSX
    .IntrinsicClassAttributes<T> {}
  interface ElementAttributesProperty {
    props: {}
  }
  interface ElementChildrenAttribute {
    children: {}
  }
}

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
