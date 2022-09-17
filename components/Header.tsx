import Link from 'next/link';

const Header = () => {
  return (
    <div className="flex justify-between p-5 max-w-7xl mx-auto ">
      <div className="flex items-center space-x-5">
        <div>
          <Link href="/">
            <img
              className="w-44 object-contain cursor-pointer"
              src="http://links.papareact.com/yvf"
              alt=""
            />
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-5">
          <h3 className="cursor-pointer">About</h3>
          <h3 className="cursor-pointer">Contact</h3>
          <h3 className="bg-green-500 text-white rounded-full px-4 py-1 cursor-pointer">
            Follow
          </h3>
        </div>
      </div>
      <div className="flex space-x-5 items-center text-green-500">
        <h3 className="cursor-pointer">sign in</h3>
        <h3 className="border border-green-500 rounded-full px-3 py-1 cursor-pointer">
          Get started
        </h3>
      </div>
    </div>
  );
};

export default Header;
