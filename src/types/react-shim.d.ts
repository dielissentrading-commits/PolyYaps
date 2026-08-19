declare module 'react' {
  export function useState<T>(initial: T): [T, (value: T | ((previous: T) => T)) => void];
  export type ReactNode = any;
}

declare module 'react-dom/client' {
  export function createRoot(element: Element): { render(node: any): void };
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
