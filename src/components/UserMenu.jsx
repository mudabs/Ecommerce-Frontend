import { Avatar, Menu, MenuItem } from '@mui/material';
import React from 'react';
import { BiUser } from 'react-icons/bi';
import { FaShoppingCart, FaUserShield } from 'react-icons/fa';
import { IoExitOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../store/actions';

const UserMenu = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isAdmin = user && user?.roles.includes("ROLE_ADMIN");
    const isSeller = user && user?.roles.includes("ROLE_SELLER");

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const logOutHandler = () => {
        handleClose();
        dispatch(logoutUser(navigate));
    };

    const username = user?.username ?? user?.email ?? 'Account';
    const avatarLetter = username?.[0]?.toUpperCase() ?? 'U';

    return (
        <div className="relative z-30">
            <button
                id="user-menu-button"
                type="button"
                className="flex flex-row items-center gap-2 rounded-full cursor-pointer hover:shadow-md transition text-white px-2 py-1 outline-none focus:outline-none focus-visible:outline-none"
                onClick={handleClick}
                aria-haspopup="menu"
                aria-expanded={open ? 'true' : undefined}
            >
                <Avatar alt={username} src="">
                    {avatarLetter}
                </Avatar>
                <span className="text-sm font-semibold text-white hidden sm:inline">
                    {username}
                </span>
            </button>

            <Menu
                sx={{ width: '400px' }}
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'user-menu-button',
                    sx: { width: 180 },
                }}
            >
                <MenuItem className="flex gap-2" component={Link} to="/profile" onClick={handleClose}>
                    <BiUser className="text-xl" />
                    <span className="font-semibold">Profile</span>
                </MenuItem>

                <MenuItem className="flex gap-2" component={Link} to="/cart" onClick={handleClose}>
                    <FaShoppingCart className="text-xl" />
                    <span className="font-semibold">Cart</span>
                </MenuItem>

                <MenuItem className="flex gap-2" component={Link} to="/profile/orders" onClick={handleClose}>
                    <FaShoppingCart className="text-xl" />
                    <span className="font-semibold">Orders</span>
                </MenuItem>

                {(isAdmin || isSeller) && (
                    <MenuItem
                        className="flex gap-2"
                        component={Link}
                        to={isAdmin ? '/admin' : '/admin/orders'}
                        onClick={handleClose}
                    >
                        <FaUserShield className="text-xl" />
                        <span className="font-semibold">{isAdmin ? 'Admin Panel' : 'Seller Panel'}</span>
                    </MenuItem>
                )}

                <MenuItem className="flex gap-2" onClick={logOutHandler}>
                    <div className="font-semibold w-full flex gap-2 items-center bg-button-gradient px-4 py-1 text-white rounded-xs">
                        <IoExitOutline className="text-xl" />
                        <span className="font-bold text-[16px] mt-1">LogOut</span>
                    </div>
                </MenuItem>
            </Menu>
        </div>
    );
}

export default UserMenu
