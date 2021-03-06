import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

export function useQuery() {
    return Object.fromEntries(new URLSearchParams(useLocation().search));
}

export default function useKeypress(key, action) {
    useEffect(() => {
        function onKeyup(e) {
            if (e.key === key) action()
        }
        window.addEventListener('keyup', onKeyup);
        return () => window.removeEventListener('keyup', onKeyup);
    }, []);
}

export const useComponentWillMount = (func) => {
    const willMount = useRef(true)

    if (willMount.current) func()

    willMount.current = false
}
