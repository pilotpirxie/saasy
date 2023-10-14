import { useEffect, useState } from "react";
import useWindowSize from "./useWindowSize";

const useIsMobile = (breakpoint: number = 768): boolean => {
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState<boolean>(width ? width <= breakpoint : false);

  useEffect(() => {
    setIsMobile((width ?? 0) <= breakpoint);
  }, [width, breakpoint]);

  return isMobile;
};

export default useIsMobile;