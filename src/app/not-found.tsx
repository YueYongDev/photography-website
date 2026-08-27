import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SiteShell } from "@/modules/site/ui/site-shell";
import styles from "@/modules/site/ui/public-site.module.css";

export default function NotFound() {
  return (
    <SiteShell>
      <section className={styles.state}>
        <div>
          <p className={styles.eyebrow}>404 / Outside the archive</p>
          <h1>This path ends here.</h1>
          <p>The page may have moved, or the field note has not been published yet.</p>
          <div style={{ marginTop: "2rem" }}>
            <Link href="/" className={styles.textLink}>
              Return home <ArrowUpRight size={15} strokeWidth={1.4} />
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
