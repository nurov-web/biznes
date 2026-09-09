import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/** next-intl холис — Link/router-и локалӣ аз ин ҷо печонида мешаванд. */
export const {
  Link: IntlLink,
  redirect,
  usePathname,
  useRouter: useIntlRouter,
  getPathname,
} = createNavigation(routing);
