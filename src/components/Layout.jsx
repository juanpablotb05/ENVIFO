export const Layout = ({children}) =>{
    return (
        <div className="m-0 p-0 box-border flex justify-center items-center min-h-screen  bg-gradient-to-r from-orange-400 to-[#F0f0f0]">
            {children}
        </div>
    )
}

export default Layout;