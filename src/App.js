import React, { lazy, Suspense, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import Header from "./components/Header";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Contact from "./components/Contact";
import Error from "./components/Error";
import ResMenu from "./components/ResMenu";
import { Provider, useDispatch } from "react-redux";
import appStore from "./redux/appStore";
import Cart from "./components/Cart";
import ShimmerUI from "./components/Shimmer";
import { useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebaseConfig";
import { addUser, removeUser } from "./redux/authSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import { fetchCartList } from "./utils/firebaseAuth";
import { addItemToCart, addMultipleItemsToCart } from "./redux/cartSlice";

let RestaurantContainer = lazy(() =>
  import("../src/components/RestaurantContainer")
);
let About = lazy(() => import("../src/components/About"));
let Login = lazy(() => import("../src/components/Login"));

const Root = () => {
  return (
    <Provider store={appStore}>
      <RouterProvider router={appRouter} />
    </Provider>
  );
};

const AppLayout = () => {
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid, email, displayName } = user;
        dispatch(
          addUser({
            uid: uid,
            email: email,
            displayName: displayName,
            isLoggedIn: true,
          })
        );
        const cartList = await fetchCartList(uid);
        dispatch(addMultipleItemsToCart(cartList));

        setIsLoggedIn(true);
      } else {
        dispatch(removeUser());
        setIsLoggedIn(false);
      }
    });
  }, []);

  return (
    <div className="app">
      {!isLoginPage && <Header isLoggedIn={isLoggedIn} />}
      <Outlet />
    </div>
  );
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<ShimmerUI />}>
            <RestaurantContainer />
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={<ShimmerUI />}>
            <About />
          </Suspense>
        ),
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/cart",
            element: <Cart />,
          },
        ],
      },
      {
        // :resId - dynamic value of restaurant id
        path: "/restaurants/:resId",
        element: <ResMenu />,
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<ShimmerUI />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/city/:city",
        element: (
          <Suspense fallback={<ShimmerUI />}>
            <RestaurantContainer />
          </Suspense>
        ),
      },
    ],
    errorElement: <Error />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
