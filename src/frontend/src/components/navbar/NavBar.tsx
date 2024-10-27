import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import LoginButton from "../auth/LoginButton";
import LogoutButton from "../auth/LogoutButton";
import { useLocation } from 'react-router';

function Navbar() {
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  // const { productsInCart } = useCart();

//   return (
//     <nav className="flex w-full bg-gray-800 text-white py-4">
//       <div className="w-full mx-auto flex justify-stretch items-center w-full">
//         <div className="flex-grow">
//           <h1 className="text-xl font-bold ml-4">Business Cards</h1>
//         </div>
//         <ul className="flex space-x-4">
//           <li><Link to="/" className="hover:text-gray-400">Dashboard</Link></li>
//           <li><Link to="/createcard" className="hover:text-gray-400">Card</Link></li>
//         </ul>
//       </div>
//       <div className="flex-shrink-0 text-lg md:text-2xl flex justify-end items-center">
//         {isAuthenticated ? <LogoutButton /> : <LoginButton />}
//       </div>
//     </nav>
//   );
// }
return (
  <div className="w-full fixed top-0 left-0 ">
    <nav className="w-full bg-stone-100 text-stone-800">
        <div className="flex items-center w-full justify-between py-3">
          <div className='text-bg-800 font-bold space-x-4'>
            <Link to="/" className="flex items-center space-x-4 text-xl">
              <img src="/Businesscard_logo.png" alt="Business Card Logo" className="w-80 h-auto rounded-md mx-4" />
              Card Exhibition
            </Link>
          </div>
          <ul className='flex items-center space-x-4'>
            <li className='w-fit'>
              <ul className='lg:flex justify-between font-bold mr-10 text-lg w-fit text-xl font-bold'>
                {location.pathname === "/" ?
                  <li className='border-b-2 border-stone-800 hover:pb-0 p-2 whitespace-nowrap'>
                    <Link to="/">Card Exhibition</Link>
                  </li>
                  :
                  <li className='hover:border-b-2 border-stone-800 hover:pb-0 p-2 whitespace-nowrap'>
                    <Link to="/">Card Exhibition</Link>
                  </li>
                }
                {location.pathname === "/createCard" ?
                  <li className='border-b-2 border-stone-800 hover:pb-0 p-2 whitespace-nowrap'>
                    <Link to="/createCard">Create Card</Link>
                  </li>
                  :
                  <li className='hover:border-b-2 border-stone-800 hover:pb-0 p-2 whitespace-nowrap'>
                    <Link to="/createCard">Create Card</Link>
                  </li>
                }
                {location.pathname === "/userProfile" ?
                  <li className='border-b-2 border-stone-800 hover:pb-0 p-2 whitespace-nowrap'>
                    <Link to="/userProfile">Profile</Link>
                  </li>
                  :
                  <li className='hover:border-b-2 border-stone-800 hover:pb-0 p-2 whitespace-nowrap'>
                    <Link to="/userProfile">Profile</Link>
                  </li>
                }
                {isAuthenticated? <LogoutButton/> : <LoginButton />}
              </ul>
            </li>
          </ul>
        </div>
    </nav>
  </div>
);

}
export default Navbar;

