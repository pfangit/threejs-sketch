import type { FC, PropsWithChildren } from "react";
import { Outlet } from "react-router";

const BaseLayout: FC<PropsWithChildren> = () => {
  return <Outlet />;
};

export default BaseLayout;
