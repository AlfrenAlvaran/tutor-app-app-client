
import { TRUST_ITEMS } from "@/constant/guest";
import TrustBadge from "../shared/TrustBadge";

export default function EnrollTrust() {
  return (
    <div className="bg-navy-950 pb-14 sm:pb-18">
      <div className="mx-auto max-w-295 px-5 sm:px-7">
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-5 border-t border-gold-600/15 pt-11 sm:justify-between">
          {TRUST_ITEMS.map((item) => (
            <TrustBadge key={item.label} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}