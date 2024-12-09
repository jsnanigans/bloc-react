/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as DemoImport } from './routes/demo'
import { Route as IndexImport } from './routes/index'
import { Route as DemoFormImport } from './routes/demo/form'
import { Route as DemoCounterImport } from './routes/demo/counter'

// Create/Update Routes

const DemoRoute = DemoImport.update({
  id: '/demo',
  path: '/demo',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const DemoFormRoute = DemoFormImport.update({
  id: '/form',
  path: '/form',
  getParentRoute: () => DemoRoute,
} as any)

const DemoCounterRoute = DemoCounterImport.update({
  id: '/counter',
  path: '/counter',
  getParentRoute: () => DemoRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/demo': {
      id: '/demo'
      path: '/demo'
      fullPath: '/demo'
      preLoaderRoute: typeof DemoImport
      parentRoute: typeof rootRoute
    }
    '/demo/counter': {
      id: '/demo/counter'
      path: '/counter'
      fullPath: '/demo/counter'
      preLoaderRoute: typeof DemoCounterImport
      parentRoute: typeof DemoImport
    }
    '/demo/form': {
      id: '/demo/form'
      path: '/form'
      fullPath: '/demo/form'
      preLoaderRoute: typeof DemoFormImport
      parentRoute: typeof DemoImport
    }
  }
}

// Create and export the route tree

interface DemoRouteChildren {
  DemoCounterRoute: typeof DemoCounterRoute
  DemoFormRoute: typeof DemoFormRoute
}

const DemoRouteChildren: DemoRouteChildren = {
  DemoCounterRoute: DemoCounterRoute,
  DemoFormRoute: DemoFormRoute,
}

const DemoRouteWithChildren = DemoRoute._addFileChildren(DemoRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/demo': typeof DemoRouteWithChildren
  '/demo/counter': typeof DemoCounterRoute
  '/demo/form': typeof DemoFormRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/demo': typeof DemoRouteWithChildren
  '/demo/counter': typeof DemoCounterRoute
  '/demo/form': typeof DemoFormRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/demo': typeof DemoRouteWithChildren
  '/demo/counter': typeof DemoCounterRoute
  '/demo/form': typeof DemoFormRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/demo' | '/demo/counter' | '/demo/form'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/demo' | '/demo/counter' | '/demo/form'
  id: '__root__' | '/' | '/demo' | '/demo/counter' | '/demo/form'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  DemoRoute: typeof DemoRouteWithChildren
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  DemoRoute: DemoRouteWithChildren,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/demo"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/demo": {
      "filePath": "demo.tsx",
      "children": [
        "/demo/counter",
        "/demo/form"
      ]
    },
    "/demo/counter": {
      "filePath": "demo/counter.tsx",
      "parent": "/demo"
    },
    "/demo/form": {
      "filePath": "demo/form.tsx",
      "parent": "/demo"
    }
  }
}
ROUTE_MANIFEST_END */
