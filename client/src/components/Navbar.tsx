import { Link, useRouteMatch, useResolvePath } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className='nav'>
      <CustomLink to='/' className='site-title'>
        Home
      </CustomLink>
      <ul>
        <li className='active'>
          <CustomLink to>About Us</CustomLink>
          <li>
            <CustomLink to>Documentation</CustomLink>
          </li>
        </li>
      </ul>
    </nav>
  );
}

// function CustomLink ({to, children, ..props}) {
//     const resolvePath = useResolvePath(to)
//     const isActive = useMatch({path: resolvePath.pathname, end: true})
//     return (
//         <li className={path === to ? "active" : ""}>
//             <Link to={to} {...props}>
//                 {children}
//             </Link>
//         </li>
//     )
// }
