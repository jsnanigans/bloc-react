import { Link } from '@tanstack/react-router';
import { FC } from 'react';

type LinkProps = React.ComponentProps<typeof Link>;

const PrettyLink: FC<LinkProps> = (props) => {
  return (
    <Link
      {...props}
      className="[&.active]:font-bold py-1 px-2 border-black border"
    >
      {props.children}
    </Link>
  );
};

export default PrettyLink;
