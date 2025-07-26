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
    <div>
      <div className="bg-primary p-5  text-white flex justify-between items-center">
        <h1 className="text-2xl">ZONG EYE</h1>
        <div className="flex gap-5">
          <h1 className="text-sm">{user?.name}</h1>

          <div>
            <Menu
              className="text-orange-300 cursor-pointer"
              size={15}
              onClick={() => setOpenMenuItems(true)}
            />

            {openMenuitems && (
              <MenuItems
                openMenuItems={openMenuitems}
                setOpenMenuItems={setOpenMenuItems}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
