// import usersGlobalStore, {
//   IUsersGlobalStore,
// } from "@/store/users-global-store";
// import { useRouter } from "next/navigation";
// import React from "react";
// import Cookies from "js-cookie";
// import { getCurrentUser } from "@/app/actions/users";
// import toast from "react-hot-toast";
// import Loader from "@/components/ui/loader";
// import ErrorMessage from "@/components/ui/error-message";
// import Header from "./header";
// function Layout({ children }: { children: React.ReactNode }) {
//   const { user, setUser } = usersGlobalStore() as IUsersGlobalStore;
//   const [loading, setloading] = React.useState(false);
//   const [error, setError] = React.useState(false);
//   const router = useRouter();

//   const fetchUser = async () => {
//     try {
//       setloading(true);
//       const token: any = Cookies.get("token");
//       const response = await getCurrentUser(token);

//       if (response.success) {
//         setUser(response.data);
//       } else {
//         setError(response.message);
//       }
//     } catch (error: any) {
//       toast.error(error.message);
//     } finally {
//       setloading(false);
//     }
//     console.log(user);
//   };
//   React.useEffect(() => {
//     fetchUser();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader />
//       </div>
//     );
//   }
//   if (error) {
//     return <ErrorMessage error="An Error has occured at layout provider" />;
//   }

//   return (
//     <div>
//       <Header />
//       <div className="p-5">{children}</div>
//     </div>
//   );
// }

// export default Layout;
