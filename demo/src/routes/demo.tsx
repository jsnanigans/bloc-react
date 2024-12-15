import { createFileRoute, Outlet } from '@tanstack/react-router';
import PrettyLink from '../components/PrettyLink.tsx';

export const Route = createFileRoute('/demo')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div className="p-2 flex gap-2">
        <PrettyLink to="/demo/counter">Counter</PrettyLink>
        <PrettyLink to="/demo/form">Form</PrettyLink>
      </div>
      <hr />
      <Outlet />
    </div>
  );
}
