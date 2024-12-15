import { createRootRoute, Outlet } from '@tanstack/react-router';
import PrettyLink from '../components/PrettyLink.tsx';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <PrettyLink to="/">Home</PrettyLink>
        <PrettyLink to="/demo">Demo</PrettyLink>
      </div>
      <Outlet />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
