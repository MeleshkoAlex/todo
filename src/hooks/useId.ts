import { useMemo } from "react";

import { getHash } from "@/utils/helper";

export const useId = () => useMemo(() => `field-${getHash()}`, []);
