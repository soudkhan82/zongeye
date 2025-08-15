// import React from "react";
// import { Menu } from "lucide-react";
// import MenuItems from "./menu-items";
// import usersGlobalStore, {
//   IUsersGlobalStore,
// } from "../store/users-global-store";

// function Header() {
//   const [openMenuitems, setOpenMenuItems] = React.useState(false);
//   const { user } = usersGlobalStore() as IUsersGlobalStore;

//   return (
//     <div>
//       <div className="bg-primary p-5  text-white flex justify-between items-center">
//         {/* <h1 className="text-3xl font-bold text-green-400 [text-shadow:_0_0_10px_rgb(34_197_94)]">
//           Zong <span className="text-white">EYE</span>
//         </h1> */}
//         <div className="relative h-15 w-12 rounded-full overflow-hidden shadow-sm ring-1 ring-black/10 self-start">
//           <img
//             src="/zongeye.png"
//             width={125}
//             height={10}
//             className="rounded-full object-cover mx-auto mb-2 shadow-sm ring-1 ring-black/10"
//           ></img>
//         </div>

//         <div className="flex gap-5">
//           <h1 className="text-sm">{user?.name}</h1>

//           <div>
//             <Menu
//               className="text-orange-300 cursor-pointer"
//               size={15}
//               onClick={() => setOpenMenuItems(true)}
//             />

//             {openMenuitems && (
//               <MenuItems
//                 openMenuItems={openMenuitems}
//                 setOpenMenuItems={setOpenMenuItems}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Header;

import React from "react";
import { Menu } from "lucide-react";
import MenuItems from "./menu-items";
import usersGlobalStore, {
  IUsersGlobalStore,
} from "../store/users-global-store";

function Header() {
  const [openMenuitems, setOpenMenuItems] = React.useState(false);
  const { user } = usersGlobalStore() as IUsersGlobalStore;

  return (
    <header>
      <div className="bg-blue-500 p-5 text-white flex justify-between items-center">
        {/* Left: logo (no rings/borders) */}
        <div className="relative h-15 w-15 rounded-full overflow-hidden">
          <img
            src="/zongeye.png"
            alt="Zong EYE Logo"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right: user + menu */}
        <div className="flex items-center gap-5">
          <span className="text-sm">{user?.name}</span>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpenMenuItems(true)}
            className="text-white/90 hover:text-white"
          >
            <Menu size={18} />
          </button>

          {openMenuitems && (
            <MenuItems
              openMenuItems={openMenuitems}
              setOpenMenuItems={setOpenMenuItems}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
